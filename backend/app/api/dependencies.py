from fastapi import Request

from app.services.assistant import AssistantService
from app.services.markets import MarketService
from app.services.weather import WeatherService


def get_weather_service(request: Request) -> WeatherService:
    return request.app.state.weather_service


def get_market_service(request: Request) -> MarketService:
    return request.app.state.market_service


def get_assistant_service(request: Request) -> AssistantService:
    return request.app.state.assistant_service
