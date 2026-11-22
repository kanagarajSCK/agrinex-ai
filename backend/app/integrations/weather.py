from datetime import datetime
from typing import Any, Protocol

import httpx

from app.core.exceptions import (
    IntegrationNotConfiguredError,
    ProviderError,
    ProviderTimeoutError,
)
from app.schemas.common import SourceAttribution
from app.schemas.weather import (
    CurrentConditions,
    DailyForecast,
    HourlyForecast,
    WeatherForecastRequest,
    WeatherForecastResponse,
)


class WeatherProvider(Protocol):
    async def get_forecast(
        self,
        request: WeatherForecastRequest,
    ) -> WeatherForecastResponse: ...


class UnconfiguredWeatherProvider:
    async def get_forecast(
        self,
        request: WeatherForecastRequest,
    ) -> WeatherForecastResponse:
        del request
        raise IntegrationNotConfiguredError("weather")


class OpenMeteoWeatherProvider:
    def __init__(
        self,
        base_url: str = "https://api.open-meteo.com",
        timeout_seconds: float = 8.0,
        transport: httpx.AsyncBaseTransport | None = None,
    ) -> None:
        self._base_url = base_url.rstrip("/")
        self._timeout_seconds = timeout_seconds
        self._transport = transport

    async def get_forecast(
        self,
        request: WeatherForecastRequest,
    ) -> WeatherForecastResponse:
        location = request.location
        if location.latitude is None or location.longitude is None:
            raise ProviderError("weather")

        params = {
            "latitude": location.latitude,
            "longitude": location.longitude,
            "current": (
                "temperature_2m,relative_humidity_2m,apparent_temperature,"
                "precipitation,weather_code,wind_speed_10m,wind_direction_10m"
            ),
            "hourly": (
                "temperature_2m,relative_humidity_2m,"
                "precipitation_probability,precipitation,wind_speed_10m"
            ),
            "daily": (
                "temperature_2m_max,temperature_2m_min,precipitation_sum,"
                "precipitation_probability_max,wind_speed_10m_max,weather_code"
            ),
            "forecast_days": request.days,
            "timezone": "Asia/Kolkata",
            "temperature_unit": "celsius",
            "wind_speed_unit": "kmh",
            "precipitation_unit": "mm",
        }

        try:
            async with httpx.AsyncClient(
                timeout=self._timeout_seconds,
                transport=self._transport,
            ) as client:
                response = await client.get(
                    f"{self._base_url}/v1/forecast",
                    params=params,
                )
                response.raise_for_status()
                payload = response.json()
        except httpx.TimeoutException as exc:
            raise ProviderTimeoutError("Open-Meteo") from exc
        except (httpx.HTTPStatusError, httpx.RequestError) as exc:
            raise ProviderError("Open-Meteo") from exc
        except (httpx.DecodingError, ValueError) as exc:
            raise ProviderError("Open-Meteo") from exc

        try:
            return self._parse_payload(payload, location_label=_location_label(location))
        except (KeyError, TypeError, ValueError, IndexError) as exc:
            raise ProviderError("Open-Meteo") from exc

    def _parse_payload(
        self,
        payload: dict[str, Any],
        location_label: str,
    ) -> WeatherForecastResponse:
        latitude = float(payload["latitude"])
        longitude = float(payload["longitude"])
        timezone = str(payload.get("timezone", "Asia/Kolkata"))
        retrieved_at = datetime.now().astimezone()

        current_payload = payload.get("current")
        current = None
        if isinstance(current_payload, dict):
            current_time = current_payload.get("time")
            current = CurrentConditions(
                temperature_c=_required_float(current_payload, "temperature_2m"),
                apparent_temperature_c=_optional_float(current_payload, "apparent_temperature"),
                humidity_percent=_optional_float(current_payload, "relative_humidity_2m"),
                precipitation_mm=_optional_float(current_payload, "precipitation"),
                weather_code=_optional_int(current_payload, "weather_code"),
                wind_speed_kph=_optional_float(current_payload, "wind_speed_10m"),
                wind_direction_deg=_optional_float(current_payload, "wind_direction_10m"),
                observed_at=_parse_datetime(current_time) if current_time else retrieved_at,
            )

        daily_payload = payload.get("daily")
        forecast: list[DailyForecast] = []
        if isinstance(daily_payload, dict):
            dates = _string_list(daily_payload, "time")
            for index, date_value in enumerate(dates):
                forecast.append(
                    DailyForecast(
                        date=_parse_date(date_value),
                        high_c=_optional_list_float(daily_payload, "temperature_2m_max", index),
                        low_c=_optional_list_float(daily_payload, "temperature_2m_min", index),
                        rain_probability_percent=_optional_list_float(
                            daily_payload, "precipitation_probability_max", index
                        ),
                        precipitation_mm=_optional_list_float(daily_payload, "precipitation_sum", index),
                        wind_speed_kph=_optional_list_float(daily_payload, "wind_speed_10m_max", index),
                        weather_code=_optional_list_int(daily_payload, "weather_code", index),
                    )
                )

        hourly_payload = payload.get("hourly")
        hourly: list[HourlyForecast] = []
        if isinstance(hourly_payload, dict):
            times = _string_list(hourly_payload, "time")
            for index, time_value in enumerate(times):
                hourly.append(
                    HourlyForecast(
                        time=_parse_datetime(time_value),
                        temperature_c=_optional_list_float(hourly_payload, "temperature_2m", index),
                        humidity_percent=_optional_list_float(
                            hourly_payload, "relative_humidity_2m", index
                        ),
                        precipitation_probability_percent=_optional_list_float(
                            hourly_payload, "precipitation_probability", index
                        ),
                        precipitation_mm=_optional_list_float(hourly_payload, "precipitation", index),
                        wind_speed_kph=_optional_list_float(hourly_payload, "wind_speed_10m", index),
                    )
                )

        return WeatherForecastResponse(
            location_label=location_label,
            latitude=latitude,
            longitude=longitude,
            timezone=timezone,
            current=current,
            forecast=forecast,
            hourly=hourly,
            source=SourceAttribution(
                provider="Open-Meteo",
                source_name="Open-Meteo Forecast API",
                source_url="https://open-meteo.com/",
                observed_at=retrieved_at,
            ),
        )


def _location_label(location: Any) -> str:
    if getattr(location, "city", None):
        return str(location.city)
    if getattr(location, "district", None):
        return str(location.district)
    return "Selected coordinates"


def _required_float(payload: dict[str, Any], key: str) -> float:
    value = payload[key]
    if value is None:
        raise ValueError(f"Missing required value: {key}")
    return float(value)


def _optional_float(payload: dict[str, Any], key: str) -> float | None:
    value = payload.get(key)
    return None if value is None else float(value)


def _optional_int(payload: dict[str, Any], key: str) -> int | None:
    value = payload.get(key)
    return None if value is None else int(value)


def _string_list(payload: dict[str, Any], key: str) -> list[str]:
    value = payload.get(key)
    if not isinstance(value, list):
        raise ValueError(f"Missing provider array: {key}")
    return [str(item) for item in value]


def _optional_list_float(payload: dict[str, Any], key: str, index: int) -> float | None:
    values = payload.get(key)
    if not isinstance(values, list) or index >= len(values) or values[index] is None:
        return None
    return float(values[index])


def _optional_list_int(payload: dict[str, Any], key: str, index: int) -> int | None:
    values = payload.get(key)
    if not isinstance(values, list) or index >= len(values) or values[index] is None:
        return None
    return int(values[index])


def _parse_date(value: str):
    return datetime.strptime(value, "%Y-%m-%d").date()


def _parse_datetime(value: str) -> datetime:
    parsed = datetime.fromisoformat(value)
    if parsed.tzinfo is None:
        parsed = parsed.replace(tzinfo=datetime.now().astimezone().tzinfo)
    return parsed
