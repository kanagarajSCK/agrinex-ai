import asyncio
from datetime import date

import httpx
import pytest

from app.core.exceptions import (
    MarketApiKeyMissingError,
    ProviderError,
    ProviderTimeoutError,
)
from app.integrations.markets import DataGovMarketProvider
from app.schemas.markets import MarketSearchRequest


VALID_RECORD = {
    "State": "Tamil Nadu",
    "District": "Salem",
    "Market": "Salem",
    "Commodity": "Tomato",
    "Variety": "Local",
    "Grade": "FAQ",
    "Arrival_Date": "22/11/2026",
    "Min_X0020_Price": "2000",
    "Max_X0020_Price": "3000",
    "Modal_X0020_Price": "2500",
}


def provider_for(handler, api_key: str = "test-key") -> DataGovMarketProvider:
    return DataGovMarketProvider(
        api_key=api_key,
        transport=httpx.MockTransport(handler),
        timeout_seconds=1,
    )


def test_valid_upstream_response_is_normalized() -> None:
    def handler(request: httpx.Request) -> httpx.Response:
        del request
        return httpx.Response(
            200,
            json={"records": [VALID_RECORD], "total": "1", "count": "1"},
        )

    async def scenario() -> None:
        result = await provider_for(handler).search_prices(
            MarketSearchRequest(state="Tamil Nadu", district="Salem", limit=20)
        )
        assert result.record_count == 1
        record = result.prices[0]
        assert record.state == "Tamil Nadu"
        assert record.arrival_date == date(2026, 11, 22)
        assert str(record.modal_price_per_quintal) == "2500"
        assert record.price_unit == "INR/quintal"

    asyncio.run(scenario())


@pytest.mark.parametrize(
    "record",
    [
        {**VALID_RECORD, "Min_X0020_Price": "not-a-price"},
        {**VALID_RECORD, "Modal_X0020_Price": None},
        {**VALID_RECORD, "Modal_X0020_Price": "-100"},
        {**VALID_RECORD, "Min_X0020_Price": "2600", "Modal_X0020_Price": "2500"},
        {**VALID_RECORD, "Modal_X0020_Price": "2500", "Unit": "kg"},
    ],
)
def test_invalid_upstream_records_are_rejected(record: dict) -> None:
    def handler(request: httpx.Request) -> httpx.Response:
        del request
        return httpx.Response(200, json={"records": [record], "total": 1})

    async def scenario() -> None:
        result = await provider_for(handler).search_prices(MarketSearchRequest(limit=20))
        assert result.record_count == 0

    asyncio.run(scenario())


def test_missing_required_fields_and_modal_are_rejected() -> None:
    incomplete = {**VALID_RECORD}
    incomplete.pop("District")

    def handler(request: httpx.Request) -> httpx.Response:
        del request
        return httpx.Response(200, json={"records": [incomplete], "total": 1})

    async def scenario() -> None:
        result = await provider_for(handler).search_prices(MarketSearchRequest(limit=20))
        assert result.prices == []

    asyncio.run(scenario())


def test_no_results_are_returned_as_empty() -> None:
    def handler(request: httpx.Request) -> httpx.Response:
        del request
        return httpx.Response(200, json={"records": [], "total": 0})

    async def scenario() -> None:
        result = await provider_for(handler).search_prices(
            MarketSearchRequest(state="Tamil Nadu", market="No Such Market", limit=20)
        )
        assert result.record_count == 0
        assert result.latest_arrival_date is None

    asyncio.run(scenario())


def test_api_key_missing() -> None:
    def handler(request: httpx.Request) -> httpx.Response:
        del request
        return httpx.Response(200, json={"records": []})

    async def scenario() -> None:
        with pytest.raises(MarketApiKeyMissingError):
            await provider_for(handler, api_key="").search_prices(MarketSearchRequest(limit=20))

    asyncio.run(scenario())


def test_provider_timeout() -> None:
    def handler(request: httpx.Request) -> httpx.Response:
        del request
        raise httpx.TimeoutException("timed out")

    async def scenario() -> None:
        with pytest.raises(ProviderTimeoutError):
            await provider_for(handler).search_prices(MarketSearchRequest(limit=20))

    asyncio.run(scenario())


@pytest.mark.parametrize("status", [400, 403, 500, 503])
def test_upstream_http_errors(status: int) -> None:
    def handler(request: httpx.Request) -> httpx.Response:
        del request
        return httpx.Response(status, json={"error": "upstream"})

    async def scenario() -> None:
        with pytest.raises(ProviderError):
            await provider_for(handler).search_prices(MarketSearchRequest(limit=20))

    asyncio.run(scenario())


def test_malformed_json() -> None:
    def handler(request: httpx.Request) -> httpx.Response:
        del request
        return httpx.Response(200, content=b"{bad-json")

    async def scenario() -> None:
        with pytest.raises(ProviderError):
            await provider_for(handler).search_prices(MarketSearchRequest(limit=20))

    asyncio.run(scenario())


def test_pagination_request_and_total() -> None:
    calls: list[httpx.Request] = []

    def handler(request: httpx.Request) -> httpx.Response:
        calls.append(request)
        page = int(request.url.params["offset"])
        records = [VALID_RECORD] if page == 0 else [VALID_RECORD]
        return httpx.Response(200, json={"records": records, "total": 2})

    async def scenario() -> None:
        result = await provider_for(handler).search_prices(
            MarketSearchRequest(limit=2)
        )
        assert result.record_count == 2
        assert len(calls) == 2
        assert calls[0].url.params["offset"] == "0"
        assert calls[1].url.params["offset"] == "1"

    asyncio.run(scenario())


def test_arrival_date_filter_is_sent_in_upstream_format() -> None:
    def handler(request: httpx.Request) -> httpx.Response:
        assert request.url.params["filters[arrival_date]"] == "22/11/2026"
        return httpx.Response(200, json={"records": [VALID_RECORD], "total": 1})

    async def scenario() -> None:
        result = await provider_for(handler).search_prices(
            MarketSearchRequest(arrival_date=date(2026, 11, 22), limit=20)
        )
        assert result.record_count == 1

    asyncio.run(scenario())


def test_stale_arrival_date_is_explicitly_marked() -> None:
    old_record = {**VALID_RECORD, "Arrival_Date": "20/11/2026"}

    def handler(request: httpx.Request) -> httpx.Response:
        del request
        return httpx.Response(200, json={"records": [old_record], "total": 1})

    async def scenario() -> None:
        result = await provider_for(handler).search_prices(MarketSearchRequest(limit=20))
        assert result.stale is True
        assert result.prices[0].stale is True

    asyncio.run(scenario())
