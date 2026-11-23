from datetime import date, datetime
from decimal import Decimal, InvalidOperation
from typing import Any, Protocol
from zoneinfo import ZoneInfo

import httpx

from app.core.exceptions import (
    IntegrationNotConfiguredError,
    MarketApiKeyMissingError,
    ProviderError,
    ProviderTimeoutError,
)
from app.schemas.common import SourceAttribution
from app.schemas.markets import MarketPrice, MarketSearchRequest, MarketSearchResponse


class MarketProvider(Protocol):
    async def search_prices(
        self,
        request: MarketSearchRequest,
    ) -> MarketSearchResponse: ...


class UnconfiguredMarketProvider:
    async def search_prices(
        self,
        request: MarketSearchRequest,
    ) -> MarketSearchResponse:
        del request
        raise IntegrationNotConfiguredError("market")


class DataGovMarketProvider:
    RESOURCE_ID = "9ef84268-d588-465a-a308-a864a43d0070"
    DEFAULT_USER_AGENT = "AgriNex-AI/1.0 (Agricultural Intelligence Platform; contact: support@agrinex.ai) Mozilla/5.0"

    def __init__(
        self,
        api_key: str,
        base_url: str = "https://api.data.gov.in",
        timeout_seconds: float = 15.0,
        transport: httpx.AsyncBaseTransport | None = None,
        resource_id: str = RESOURCE_ID,
    ) -> None:
        self._api_key = api_key.strip().strip("\"'").strip()
        self._base_url = base_url.rstrip("/")
        self._timeout_seconds = timeout_seconds
        self._transport = transport
        self._resource_id = resource_id

    async def search_prices(
        self,
        request: MarketSearchRequest,
    ) -> MarketSearchResponse:
        if not self._api_key or self._api_key == "your-datagov-api-key-here":
            raise MarketApiKeyMissingError()

        retrieved_at = datetime.now(ZoneInfo("Asia/Kolkata"))
        records: list[MarketPrice] = []
        upstream_total: int | None = None
        page_size = min(request.limit, 100)
        offset = request.offset

        while len(records) < request.limit:
            remaining = request.limit - len(records)
            params: dict[str, str | int] = {
                "api-key": self._api_key,
                "format": "json",
                "limit": min(page_size, remaining),
                "offset": offset,
            }
            for field_name, value in (
                ("state", request.state),
                ("district", request.district),
                ("market", request.market),
                ("commodity", request.commodity),
                ("variety", request.variety),
                ("grade", request.grade),
            ):
                if value:
                    params[f"filters[{field_name}]"] = value
            if request.arrival_date:
                params["filters[arrival_date]"] = request.arrival_date.strftime("%d/%m/%Y")

            try:
                headers = {"User-Agent": self.DEFAULT_USER_AGENT}
                async with httpx.AsyncClient(
                    timeout=self._timeout_seconds,
                    transport=self._transport,
                    headers=headers,
                ) as client:
                    response = await client.get(
                        f"{self._base_url}/resource/{self._resource_id}",
                        params=params,
                    )
                    response.raise_for_status()
                    payload = response.json()
            except httpx.TimeoutException as exc:
                raise ProviderTimeoutError("data.gov.in") from exc
            except httpx.HTTPStatusError as exc:
                status = exc.response.status_code
                if status in (401, 403):
                    raise ProviderError(
                        "data.gov.in",
                        f"HTTP {status} (Key not authorised or rejected by data.gov.in. Please check DATA_GOV_IN_API_KEY in Render environment variables)",
                    ) from exc
                raise ProviderError("data.gov.in", f"HTTP {status}") from exc
            except httpx.RequestError as exc:
                raise ProviderError(
                    "data.gov.in",
                    f"Connection failed ({type(exc).__name__})",
                ) from exc
            except (httpx.DecodingError, ValueError) as exc:
                raise ProviderError("data.gov.in", "Upstream returned non-JSON response") from exc

            if not isinstance(payload, dict):
                raise ProviderError("data.gov.in")
            raw_records = payload.get("records")
            if not isinstance(raw_records, list):
                raise ProviderError("data.gov.in")
            if upstream_total is None:
                total = payload.get("total")
                if isinstance(total, int):
                    upstream_total = total
                elif isinstance(total, str):
                    try:
                        upstream_total = int(total)
                    except ValueError:
                        upstream_total = None

            page_valid_count = 0
            for raw in raw_records:
                if not isinstance(raw, dict):
                    continue
                parsed = self._parse_record(raw, retrieved_at)
                if parsed is not None:
                    records.append(parsed)
                    page_valid_count += 1
                    if len(records) >= request.limit:
                        break

            if not raw_records:
                break
            if upstream_total is not None and offset + len(raw_records) >= upstream_total:
                break
            if page_valid_count == 0 and len(records) == 0:
                break
            offset += len(raw_records)

        latest = max(
            (record.arrival_date for record in records),
            default=None,
        )
        today = retrieved_at.date()
        stale = latest is not None and latest < today
        source = SourceAttribution(
            provider="data.gov.in",
            source_name="AGMARKNET / data.gov.in",
            source_url=(
                "https://data.gov.in/resource/"
                "variety-wise-daily-market-prices-data-commodity"
            ),
            observed_at=retrieved_at,
        )
        for record in records:
            record.stale = record.arrival_date < today

        return MarketSearchResponse(
            prices=records,
            record_count=len(records),
            latest_arrival_date=latest,
            retrieved_at=retrieved_at,
            source=source,
            stale=stale,
            upstream_total=upstream_total,
        )

    def _parse_record(
        self,
        raw: dict[str, Any],
        retrieved_at: datetime,
    ) -> MarketPrice | None:
        state = _raw_text(raw, ("state", "state_name"))
        district = _raw_text(raw, ("district", "district_name"))
        market = _raw_text(raw, ("market", "market_name"))
        commodity = _raw_text(raw, ("commodity", "commodity_name"))
        arrival = _raw_text(raw, ("arrival_date", "arrivaldate", "arrival"))
        if not all((state, district, market, commodity, arrival)):
            return None

        try:
            arrival_date = _parse_arrival_date(arrival)
            modal = _parse_positive_decimal(_raw_text(raw, (
                "modal_price", "modalprice", "modal_x0020_price",
            )))
        except (InvalidOperation, ValueError):
            return None
        if modal is None:
            return None

        try:
            minimum = _parse_optional_positive_decimal(_raw_text(raw, (
                "min_price", "minprice", "min_x0020_price",
            )))
            maximum = _parse_optional_positive_decimal(_raw_text(raw, (
                "max_price", "maxprice", "max_x0020_price",
            )))
        except InvalidOperation:
            return None
        if minimum is not None and maximum is not None and minimum > maximum:
            return None
        if minimum is not None and modal < minimum:
            return None
        if maximum is not None and modal > maximum:
            return None

        unit = _raw_text(raw, ("price_unit", "unit", "price_unit_name"))
        if unit and not _is_quintal_unit(unit):
            return None

        source = SourceAttribution(
            provider="data.gov.in",
            source_name="AGMARKNET / data.gov.in",
            source_url=(
                "https://data.gov.in/resource/"
                "variety-wise-daily-market-prices-data-commodity"
            ),
            observed_at=retrieved_at,
        )
        return MarketPrice(
            state=state,
            district=district,
            market=market,
            commodity=commodity,
            variety=_raw_text(raw, ("variety", "variety_name")),
            grade=_raw_text(raw, ("grade", "grade_name")),
            arrival_date=arrival_date,
            min_price_per_quintal=minimum,
            max_price_per_quintal=maximum,
            modal_price_per_quintal=modal,
            price_unit="INR/quintal",
            retrieved_at=retrieved_at,
            source=source,
        )


def _normalize_key(value: str) -> str:
    return "".join(
        character
        for character in value.lower().replace("x0020", "")
        if character.isalnum()
    )


def _raw_text(raw: dict[str, Any], aliases: tuple[str, ...]) -> str | None:
    normalized_aliases = {_normalize_key(alias) for alias in aliases}
    for key, value in raw.items():
        if _normalize_key(str(key)) in normalized_aliases:
            if value is None:
                return None
            text = str(value).strip()
            return text or None
    return None


def _parse_positive_decimal(value: str | None) -> Decimal | None:
    if value is None:
        return None
    cleaned = value.replace(",", "").replace("₹", "").replace("Rs.", "").strip()
    if not cleaned:
        return None
    parsed = Decimal(cleaned)
    if not parsed.is_finite() or parsed <= 0:
        raise InvalidOperation
    return parsed


def _parse_optional_positive_decimal(value: str | None) -> Decimal | None:
    if value is None:
        return None
    return _parse_positive_decimal(value)


def _parse_arrival_date(value: str) -> date:
    for date_format in ("%Y-%m-%d", "%d/%m/%Y", "%d-%m-%Y", "%Y/%m/%d"):
        try:
            return datetime.strptime(value, date_format).date()
        except ValueError:
            continue
    raise ValueError("Unsupported arrival date")


def _is_quintal_unit(unit: str) -> bool:
    normalized = "".join(character for character in unit.lower() if character.isalnum())
    return normalized in {
        "inrquintal",
        "rsquintal",
        "rsquintals",
        "rupeesquintal",
        "quintal",
    }
