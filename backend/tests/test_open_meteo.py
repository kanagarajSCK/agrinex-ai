import asyncio

import httpx
import pytest
from fastapi.testclient import TestClient

from app.core.config import Settings
from app.core.exceptions import ProviderError, ProviderTimeoutError
from app.integrations.providers import ProviderSet
from app.integrations.weather import OpenMeteoWeatherProvider
from app.main import create_app
from app.schemas.weather import WeatherForecastRequest, LocationInput


VALID_RESPONSE = {
    "latitude": 11.6643,
    "longitude": 78.146,
    "timezone": "Asia/Kolkata",
    "timezone_abbreviation": "IST",
    "current": {
        "time": "2026-11-22T10:15",
        "temperature_2m": 28.4,
        "relative_humidity_2m": 68,
        "apparent_temperature": 30.1,
        "precipitation": 0.0,
        "weather_code": 1,
        "wind_speed_10m": 12.5,
        "wind_direction_10m": 240,
    },
    "hourly": {
        "time": ["2026-11-22T10:00", "2026-11-22T11:00"],
        "temperature_2m": [28.4, 29.1],
        "relative_humidity_2m": [68, 65],
        "precipitation_probability": [10, 12],
        "precipitation": [0.0, 0.0],
        "wind_speed_10m": [12.5, 13.0],
    },
    "daily": {
        "time": ["2026-11-22", "2026-11-23"],
        "temperature_2m_max": [31.2, 30.5],
        "temperature_2m_min": [22.1, 21.8],
        "precipitation_sum": [0.0, 1.2],
        "precipitation_probability_max": [20, 45],
        "wind_speed_10m_max": [15.0, 14.2],
        "weather_code": [1, 61],
    },
}


def provider_for(handler) -> OpenMeteoWeatherProvider:
    return OpenMeteoWeatherProvider(
        transport=httpx.MockTransport(handler),
        timeout_seconds=1,
    )


def test_valid_open_meteo_response_is_typed() -> None:
    def handler(request: httpx.Request) -> httpx.Response:
        assert request.url.params["timezone"] == "Asia/Kolkata"
        assert request.url.params["forecast_days"] == "7"
        assert "wind_speed_10m" in request.url.params["current"]
        return httpx.Response(200, json=VALID_RESPONSE)

    async def scenario() -> None:
        provider = provider_for(handler)
        result = await provider.get_forecast(
            WeatherForecastRequest(location=LocationInput(latitude=11.6643, longitude=78.146))
        )
        assert result.latitude == 11.6643
        assert result.current is not None
        assert result.current.temperature_c == 28.4
        assert len(result.forecast) == 2
        assert len(result.hourly) == 2
        assert result.timezone == "Asia/Kolkata"
        assert result.units.precipitation == "mm"

    asyncio.run(scenario())


def test_provider_timeout() -> None:
    def handler(request: httpx.Request) -> httpx.Response:
        del request
        raise httpx.TimeoutException("timed out")

    async def scenario() -> None:
        provider = provider_for(handler)
        with pytest.raises(ProviderTimeoutError):
            await provider.get_forecast(
                WeatherForecastRequest(location=LocationInput(latitude=11.6643, longitude=78.146))
            )

    asyncio.run(scenario())


def test_provider_http_error() -> None:
    def handler(request: httpx.Request) -> httpx.Response:
        del request
        return httpx.Response(503, json={"reason": "unavailable"})

    async def scenario() -> None:
        provider = provider_for(handler)
        with pytest.raises(ProviderError):
            await provider.get_forecast(
                WeatherForecastRequest(location=LocationInput(latitude=11.6643, longitude=78.146))
            )

    asyncio.run(scenario())


def test_malformed_provider_response() -> None:
    def handler(request: httpx.Request) -> httpx.Response:
        del request
        return httpx.Response(200, content=b"{not-json", headers={"content-type": "application/json"})

    async def scenario() -> None:
        provider = provider_for(handler)
        with pytest.raises(ProviderError):
            await provider.get_forecast(
                WeatherForecastRequest(location=LocationInput(latitude=11.6643, longitude=78.146))
            )

    asyncio.run(scenario())


def test_missing_optional_fields_are_allowed() -> None:
    payload = {
        "latitude": 11.6643,
        "longitude": 78.146,
        "timezone": "Asia/Kolkata",
        "current": {"temperature_2m": 28.4},
    }

    def handler(request: httpx.Request) -> httpx.Response:
        del request
        return httpx.Response(200, json=payload)

    async def scenario() -> None:
        provider = provider_for(handler)
        result = await provider.get_forecast(
            WeatherForecastRequest(location=LocationInput(latitude=11.6643, longitude=78.146))
        )
        assert result.current is not None
        assert result.current.apparent_temperature_c is None
        assert result.forecast == []
        assert result.hourly == []

    asyncio.run(scenario())


@pytest.mark.parametrize(
    ("latitude", "longitude"),
    [(-91, 78.146), (91, 78.146), (11.6643, -181), (11.6643, 181)],
)
def test_coordinate_validation(latitude: float, longitude: float) -> None:
    test_app = create_app(Settings(environment="test"), ProviderSet())
    response = TestClient(test_app).get(
        "/api/v1/weather/forecast",
        params={"latitude": latitude, "longitude": longitude},
    )
    assert response.status_code == 422


def test_weather_api_success_schema() -> None:
    def handler(request: httpx.Request) -> httpx.Response:
        del request
        return httpx.Response(200, json=VALID_RESPONSE)

    test_app = create_app(
        Settings(environment="test"),
        ProviderSet(weather=provider_for(handler)),
    )
    response = TestClient(test_app).get(
        "/api/v1/weather/forecast",
        params={"latitude": 11.6643, "longitude": 78.146, "days": 7},
    )

    assert response.status_code == 200
    body = response.json()
    assert body["data"]["timezone"] == "Asia/Kolkata"
    assert body["data"]["units"]["temperature"] == "°C"
    assert body["data"]["source"]["provider"] == "Open-Meteo"
    assert body["request_id"] == response.headers["X-Request-ID"]
