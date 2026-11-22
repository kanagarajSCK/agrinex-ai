from fastapi import Request

from app.services.assistant import AssistantService
from app.services.markets import MarketService
from app.services.weather import WeatherService
from app.rag.retrieval import RetrievalService
from app.rag.ingestion import KnowledgeIngestionService
from app.locations.repository import LocationRepository


def get_weather_service(request: Request) -> WeatherService:
    return request.app.state.weather_service


def get_market_service(request: Request) -> MarketService:
    return request.app.state.market_service


def get_assistant_service(request: Request) -> AssistantService:
    return request.app.state.assistant_service


def get_rag_retrieval(request: Request) -> RetrievalService:
    return request.app.state.rag_retrieval


def get_rag_ingestion(request: Request) -> KnowledgeIngestionService:
    return request.app.state.rag_ingestion


def get_location_repository(request: Request) -> LocationRepository:
    return request.app.state.location_repository
