from typing import Protocol

from app.core.exceptions import IntegrationNotConfiguredError
from app.schemas.weather import WeatherForecastRequest, WeatherForecastResponse


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
