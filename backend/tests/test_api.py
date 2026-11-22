import asyncio

from fastapi.testclient import TestClient
import pytest
from pydantic import ValidationError

from app.core.config import Settings
from app.core.exceptions import ProviderError
from app.integrations.providers import ProviderSet
from app.main import app, create_app
from app.schemas.weather import WeatherForecastRequest, WeatherForecastResponse


def test_unconfigured_integrations_return_explicit_service_unavailable() -> None:
    client = TestClient(app)
    requests = [
        ("/api/v1/weather/forecast", {"location": {"city": "Salem"}}),
        ("/api/v1/markets/search", {"commodity": "tomato"}),
        ("/api/v1/assistant/questions", {"question": "How do I identify this crop?", "language": "en"}),
    ]

    for path, payload in requests:
        response = client.post(path, json=payload)
        assert response.status_code == 503
        assert response.json()["error"]["code"] == "INTEGRATION_NOT_CONFIGURED"
        assert response.json()["error"]["request_id"] == response.headers["X-Request-ID"]


def test_validation_error_uses_standard_envelope_without_echoing_input() -> None:
    client = TestClient(app)
    response = client.post(
        "/api/v1/weather/forecast",
        json={"location": {"city": "private-farm-label"}, "days": 8},
    )

    assert response.status_code == 422
    body = response.json()
    assert body["error"]["code"] == "REQUEST_VALIDATION_ERROR"
    assert body["error"]["issues"][0]["field"] == "days"
    assert "private-farm-label" not in response.text


def test_cors_allows_only_configured_origins() -> None:
    client = TestClient(app)
    allowed = client.options(
        "/api/v1/health",
        headers={
            "Origin": "http://localhost:3000",
            "Access-Control-Request-Method": "POST",
        },
    )
    denied = client.options(
        "/api/v1/health",
        headers={
            "Origin": "https://unapproved.example",
            "Access-Control-Request-Method": "POST",
        },
    )

    assert allowed.headers["access-control-allow-origin"] == "http://localhost:3000"
    assert "access-control-allow-origin" not in denied.headers
    assert "access-control-allow-credentials" not in allowed.headers


def test_settings_reject_wildcard_cors_origins() -> None:
    with pytest.raises(ValidationError):
        Settings(allowed_origins=["*"])


def test_openapi_exposes_versioned_operations() -> None:
    client = TestClient(app)
    response = client.get("/api/v1/openapi.json")

    assert response.status_code == 200
    paths = response.json()["paths"]
    assert "/api/v1/health" in paths
    assert "/api/v1/weather/forecast" in paths
    assert "/api/v1/markets/search" in paths
    assert "/api/v1/assistant/questions" in paths


class SlowWeatherProvider:
    async def get_forecast(
        self,
        request: WeatherForecastRequest,
    ) -> WeatherForecastResponse:
        del request
        await asyncio.sleep(0.1)
        raise AssertionError("The timed-out provider should not complete")


def test_provider_timeout_returns_safe_gateway_timeout() -> None:
    test_app = create_app(
        Settings(environment="test", provider_timeout_seconds=0.01),
        ProviderSet(weather=SlowWeatherProvider()),
    )
    response = TestClient(test_app).post(
        "/api/v1/weather/forecast",
        json={"location": {"city": "Salem"}},
    )

    assert response.status_code == 504
    assert response.json()["error"]["code"] == "PROVIDER_TIMEOUT"
    assert "timed out" not in response.text


class FailedWeatherProvider:
    async def get_forecast(
        self,
        request: WeatherForecastRequest,
    ) -> WeatherForecastResponse:
        del request
        raise ProviderError("weather")


def test_provider_failure_has_safe_error_response() -> None:
    test_app = create_app(
        Settings(environment="test"),
        ProviderSet(weather=FailedWeatherProvider()),
    )
    response = TestClient(test_app).post(
        "/api/v1/weather/forecast",
        json={"location": {"city": "Salem"}},
    )

    assert response.status_code == 502
    assert response.json()["error"]["code"] == "PROVIDER_ERROR"
