from datetime import datetime
from typing import Protocol
from zoneinfo import ZoneInfo

import httpx

from app.core.exceptions import ProviderError, ProviderTimeoutError


class GeocodingProvider(Protocol):
    async def resolve(
        self,
        name: str,
        state_name: str | None,
        district_name: str | None,
    ) -> tuple[float, float, str, datetime] | None: ...


class OpenMeteoGeocodingProvider:
    def __init__(
        self,
        base_url: str = "https://geocoding-api.open-meteo.com",
        timeout_seconds: float = 8.0,
        transport: httpx.AsyncBaseTransport | None = None,
    ) -> None:
        self._base_url = base_url.rstrip("/")
        self._timeout_seconds = timeout_seconds
        self._transport = transport

    async def resolve(
        self,
        name: str,
        state_name: str | None,
        district_name: str | None,
    ) -> tuple[float, float, str, datetime] | None:
        params = {
            "name": name,
            "count": 5,
            "language": "en",
            "countryCode": "IN",
        }
        try:
            async with httpx.AsyncClient(
                timeout=self._timeout_seconds,
                transport=self._transport,
            ) as client:
                response = await client.get(
                    f"{self._base_url}/v1/search",
                    params=params,
                )
                response.raise_for_status()
                payload = response.json()
        except httpx.TimeoutException as exc:
            raise ProviderTimeoutError("Open-Meteo geocoding") from exc
        except (httpx.HTTPStatusError, httpx.RequestError, ValueError) as exc:
            raise ProviderError("Open-Meteo geocoding") from exc

        results = payload.get("results") if isinstance(payload, dict) else None
        if not isinstance(results, list):
            return None

        matching = []
        for result in results:
            if not isinstance(result, dict):
                continue
            if str(result.get("country_code", "")).upper() != "IN":
                continue
            admin1 = str(result.get("admin1", "")).casefold()
            admin2 = str(result.get("admin2", "")).casefold()
            if state_name and state_name.casefold() not in admin1:
                continue
            if district_name and district_name.casefold() not in admin2:
                continue
            latitude = result.get("latitude")
            longitude = result.get("longitude")
            if isinstance(latitude, (int, float)) and isinstance(longitude, (int, float)):
                matching.append((float(latitude), float(longitude), str(result.get("name", name))))

        if len(matching) != 1:
            return None
        latitude, longitude, resolved_name = matching[0]
        return (
            latitude,
            longitude,
            resolved_name,
            datetime.now(ZoneInfo("Asia/Kolkata")),
        )
