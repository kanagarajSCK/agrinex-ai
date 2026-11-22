import asyncio

from app.core.cache import InMemoryTTLCache
from app.schemas.common import SourceAttribution
from app.schemas.weather import WeatherForecastRequest, WeatherForecastResponse
from app.services.provider_calls import request_cache_key
from app.services.weather import WeatherService


class CountingWeatherProvider:
    def __init__(self) -> None:
        self.calls = 0

    async def get_forecast(
        self,
        request: WeatherForecastRequest,
    ) -> WeatherForecastResponse:
        self.calls += 1
        return WeatherForecastResponse(
            location_label=request.location.city or "Unknown",
            source=SourceAttribution(
                provider="sample",
                source_name="Test provider",
            ),
        )


def test_weather_service_reuses_cached_provider_result() -> None:
    async def scenario() -> None:
        provider = CountingWeatherProvider()
        service = WeatherService(
            provider=provider,
            cache=InMemoryTTLCache[WeatherForecastResponse](),
            timeout_seconds=1,
            cache_ttl_seconds=30,
        )
        request = WeatherForecastRequest(location={"city": "Salem"})

        first = await service.get_forecast(request)
        second = await service.get_forecast(request)

        assert first == second
        assert provider.calls == 1

    asyncio.run(scenario())


def test_cache_key_does_not_expose_location() -> None:
    request = WeatherForecastRequest(location={"city": "private-farm-label"})

    key = request_cache_key("weather", request)

    assert "private-farm-label" not in key
    assert key.startswith("weather:")
