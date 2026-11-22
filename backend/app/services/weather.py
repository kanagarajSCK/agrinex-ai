from app.core.cache import AsyncCache
from app.integrations.weather import WeatherProvider
from app.schemas.weather import WeatherForecastRequest, WeatherForecastResponse
from app.services.provider_calls import call_with_timeout, request_cache_key


class WeatherService:
    def __init__(
        self,
        provider: WeatherProvider,
        cache: AsyncCache[WeatherForecastResponse],
        timeout_seconds: float,
        cache_ttl_seconds: float,
    ) -> None:
        self._provider = provider
        self._cache = cache
        self._timeout_seconds = timeout_seconds
        self._cache_ttl_seconds = cache_ttl_seconds

    async def get_forecast(self, request: WeatherForecastRequest) -> WeatherForecastResponse:
        cache_key = request_cache_key("weather", request)
        if self._cache_ttl_seconds > 0:
            cached = await self._cache.get(cache_key)
            if cached is not None:
                return cached

        forecast = await call_with_timeout(
            "weather",
            self._provider.get_forecast(request),
            self._timeout_seconds,
        )
        if self._cache_ttl_seconds > 0:
            await self._cache.set(cache_key, forecast, self._cache_ttl_seconds)
        return forecast
