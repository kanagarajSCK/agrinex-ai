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

    async def reverse(
        self,
        latitude: float,
        longitude: float,
    ) -> dict[str, str] | None:
        headers = {"User-Agent": "AgriNex-AI/1.0"}
        try:
            async with httpx.AsyncClient(
                timeout=self._timeout_seconds,
                transport=self._transport,
                headers=headers,
            ) as client:
                # Primary: BigDataCloud free client reverse geocoding
                url = (
                    f"https://api.bigdatacloud.net/data/reverse-geocode-client"
                    f"?latitude={latitude}&longitude={longitude}&localityLanguage=en"
                )
                try:
                    resp = await client.get(url)
                    if resp.status_code == 200:
                        payload = resp.json()
                        country_code = str(payload.get("countryCode", "")).upper()
                        if country_code and country_code != "IN":
                            return {"country": payload.get("countryName", "Outside India"), "outside_india": "true"}

                        state = payload.get("principalSubdivision", "")
                        city = payload.get("city", "")
                        locality = payload.get("locality", "")

                        district = ""
                        subdistrict = ""
                        for admin in payload.get("localityInfo", {}).get("administrative", []):
                            desc = str(admin.get("description", "")).lower()
                            name = str(admin.get("name", ""))
                            if "district" in desc or "district" in name.lower():
                                district = name.replace(" district", "").replace(" District", "").strip()
                            elif "taluk" in desc or "taluk" in name.lower() or "tehsil" in desc or "tehsil" in name.lower():
                                subdistrict = name.replace(" taluk", "").replace(" Taluk", "").replace(" tehsil", "").strip()

                        if not district and city:
                            district = city

                        return {
                            "country": "India",
                            "state_name": state,
                            "district_name": district,
                            "city_name": city or locality or district,
                            "locality_name": locality or city,
                            "subdistrict_name": subdistrict,
                        }
                except Exception:
                    pass

                # Fallback: OpenStreetMap Nominatim
                nom_url = f"https://nominatim.openstreetmap.org/reverse?lat={latitude}&lon={longitude}&format=json"
                try:
                    resp = await client.get(nom_url)
                    if resp.status_code == 200:
                        data = resp.json()
                        address = data.get("address", {})
                        country_code = str(address.get("country_code", "")).upper()
                        if country_code and country_code != "IN":
                            return {"country": address.get("country", "Outside India"), "outside_india": "true"}

                        state = address.get("state", "")
                        district = address.get("state_district") or address.get("county") or address.get("district", "")
                        district = district.replace(" district", "").replace(" District", "").strip()
                        city = address.get("city") or address.get("town") or address.get("village") or address.get("suburb", "")
                        subdistrict = address.get("subdistrict") or address.get("county", "")

                        return {
                            "country": "India",
                            "state_name": state,
                            "district_name": district,
                            "city_name": city,
                            "locality_name": city,
                            "subdistrict_name": subdistrict,
                        }
                except Exception:
                    pass

        except Exception as exc:
            raise ProviderError("Reverse geocoding") from exc
        return None
