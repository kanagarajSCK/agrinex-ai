import logging
import time
from uuid import uuid4

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.base import RequestResponseEndpoint
from starlette.responses import Response

from app.api.v1.router import api_router
from app.core.cache import InMemoryTTLCache
from app.core.config import Settings, get_settings
from app.core.errors import register_exception_handlers
from app.core.logging import configure_logging, request_id_context
from app.integrations.providers import ProviderSet
from app.integrations.markets import DataGovMarketProvider
from app.integrations.weather import OpenMeteoWeatherProvider
from app.schemas.markets import MarketSearchResponse
from app.schemas.weather import WeatherForecastResponse
from app.services.assistant import AssistantService
from app.services.markets import MarketService
from app.services.weather import WeatherService


def create_app(
    settings: Settings | None = None,
    providers: ProviderSet | None = None,
) -> FastAPI:
    app_settings = settings or get_settings()
    integrations = providers or ProviderSet(
        weather=OpenMeteoWeatherProvider(
            base_url=app_settings.open_meteo_base_url,
            timeout_seconds=app_settings.provider_timeout_seconds,
        ),
        markets=DataGovMarketProvider(
            api_key=app_settings.data_gov_in_api_key,
            base_url=app_settings.data_gov_in_base_url,
            timeout_seconds=app_settings.provider_timeout_seconds,
            resource_id=app_settings.data_gov_in_resource_id,
        ),
    )
    logger = configure_logging(app_settings.log_level)

    app = FastAPI(
        title=app_settings.app_name,
        description=(
            "Versioned, provider-independent API foundation for AgriNex AI. "
            "External data and AI integrations remain unconfigured until later phases."
        ),
        version="0.5.0",
        docs_url="/docs",
        redoc_url="/redoc",
        openapi_url=f"{app_settings.api_v1_prefix}/openapi.json",
        openapi_tags=[
            {"name": "system", "description": "Service status"},
            {"name": "weather", "description": "Weather provider operations"},
            {"name": "markets", "description": "Mandi market data operations"},
            {"name": "assistant", "description": "Agricultural AI question operations"},
        ],
    )
    app.state.settings = app_settings
    app.state.weather_service = WeatherService(
        provider=integrations.weather,
        cache=InMemoryTTLCache[WeatherForecastResponse](
            max_entries=app_settings.cache_max_entries,
        ),
        timeout_seconds=app_settings.provider_timeout_seconds,
        cache_ttl_seconds=app_settings.cache_ttl_seconds,
    )
    app.state.market_service = MarketService(
        provider=integrations.markets,
        cache=InMemoryTTLCache[MarketSearchResponse](
            max_entries=app_settings.cache_max_entries,
        ),
        timeout_seconds=app_settings.provider_timeout_seconds,
        cache_ttl_seconds=app_settings.market_cache_ttl_seconds,
    )
    app.state.assistant_service = AssistantService(
        provider=integrations.gemini,
        timeout_seconds=app_settings.provider_timeout_seconds,
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=app_settings.allowed_origins,
        allow_credentials=False,
        allow_methods=["GET", "POST"],
        allow_headers=["Content-Type", "X-Request-ID"],
        expose_headers=["X-Request-ID"],
    )

    @app.middleware("http")
    async def request_context(
        request: Request,
        call_next: RequestResponseEndpoint,
    ) -> Response:
        request_id = uuid4().hex
        request.state.request_id = request_id
        token = request_id_context.set(request_id)
        started_at = time.perf_counter()
        status_code = 500
        try:
            response = await call_next(request)
            status_code = response.status_code
            response.headers["X-Request-ID"] = request_id
            return response
        finally:
            route = request.scope.get("route")
            route_path = getattr(route, "path", "unmatched")
            logger.info(
                "request.completed",
                extra={
                    "request_id": request_id,
                    "method": request.method,
                    "path": route_path,
                    "status_code": status_code,
                    "duration_ms": round((time.perf_counter() - started_at) * 1000, 2),
                },
            )
            request_id_context.reset(token)

    register_exception_handlers(app)
    app.include_router(api_router, prefix=app_settings.api_v1_prefix)
    return app


app = create_app()
