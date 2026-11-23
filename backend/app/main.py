import logging
import time
from uuid import uuid4

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from starlette.middleware.base import RequestResponseEndpoint
from starlette.responses import Response

from app.api.v1.router import api_router
from app.core.cache import InMemoryTTLCache
from app.core.config import Settings, get_settings
from app.core.errors import register_exception_handlers
from app.core.logging import configure_logging, request_id_context
from app.schemas.common import ApiResponse
from app.integrations.providers import ProviderSet
from app.integrations.markets import DataGovMarketProvider
from app.integrations.gemini import GoogleGeminiProvider
from app.integrations.weather import OpenMeteoWeatherProvider
from app.schemas.markets import MarketSearchResponse
from app.schemas.weather import WeatherForecastResponse
from app.services.assistant import AssistantService
from app.services.markets import MarketService
from app.services.weather import WeatherService
from app.rag.embedding import GoogleEmbeddingProvider
from app.rag.retrieval import RetrievalService
from app.rag.store import ChromaVectorStore, InMemoryVectorStore
from app.rag.ingestion import KnowledgeIngestionService
from app.locations.repository import LocationRepository


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
        gemini=GoogleGeminiProvider(
            api_key=app_settings.gemini_api_key,
            model=app_settings.gemini_model,
            timeout_seconds=app_settings.gemini_timeout_seconds,
        ),
    )
    logger = configure_logging(app_settings.log_level)

    app = FastAPI(
        title=app_settings.app_name,
        description=(
            "Versioned, provider-independent API foundation for AgriNex AI. "
            "External data and AI integrations remain unconfigured until later phases."
        ),
        version="0.8.0",
        docs_url="/docs",
        redoc_url="/redoc",
        openapi_url=f"{app_settings.api_v1_prefix}/openapi.json",
        openapi_tags=[
            {"name": "system", "description": "Service status"},
            {"name": "weather", "description": "Weather provider operations"},
            {"name": "markets", "description": "Mandi market data operations"},
            {"name": "assistant", "description": "Agricultural AI question operations"},
            {"name": "knowledge", "description": "Controlled agricultural knowledge retrieval"},
            {"name": "locations", "description": "India LGD location selection and resolution"},
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
    try:
        rag_store = ChromaVectorStore(app_settings.rag_store_path)
    except Exception as exc:
        # Core API routes must remain usable when the optional local RAG runtime
        # is unavailable; this empty store never fabricates retrieval evidence.
        logger.warning("rag.store_unavailable", extra={"reason": str(exc)})
        rag_store = InMemoryVectorStore()
    rag_embedding = GoogleEmbeddingProvider(
        api_key=app_settings.gemini_api_key,
        model=app_settings.embedding_model,
        dimensions=app_settings.embedding_dimensions,
        timeout_seconds=app_settings.gemini_timeout_seconds,
    )
    rag_retrieval = RetrievalService(
        embedding_provider=rag_embedding,
        store=rag_store,
        top_k=app_settings.rag_top_k,
        relevance_threshold=app_settings.rag_relevance_threshold,
        max_context_chars=app_settings.rag_max_context_chars,
    )
    app.state.rag_ingestion = KnowledgeIngestionService(
        embedding_provider=rag_embedding,
        store=rag_store,
        manifest_path=app_settings.rag_documents_path,
    )
    app.state.rag_retrieval = rag_retrieval
    app.state.location_repository = LocationRepository(
        app_settings.lgd_snapshot_path,
        app_settings.lgd_backup_path,
    )
    app.state.assistant_service = AssistantService(
        provider=integrations.gemini,
        weather_service=app.state.weather_service,
        market_service=app.state.market_service,
        timeout_seconds=app_settings.gemini_timeout_seconds,
        max_output_tokens=app_settings.gemini_max_output_tokens,
        max_history=app_settings.assistant_max_history,
        max_tool_iterations=app_settings.assistant_max_tool_iterations,
        retrieval_service=rag_retrieval,
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=app_settings.allowed_origins,
        allow_origin_regex=r"^https:\/\/([a-z0-9-]+\.)*vercel\.app$",
        allow_credentials=False,
        allow_methods=["GET", "POST", "OPTIONS"],
        allow_headers=["Content-Type", "X-Request-ID", "Accept"],
        expose_headers=["X-Request-ID"],
    )

    assistant_windows: dict[str, list[float]] = {}

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
            if (
                request.method != "OPTIONS"
                and request.url.path == f"{app_settings.api_v1_prefix}/assistant/chat"
                and request.headers.get("content-length")
            ):
                try:
                    content_length = int(request.headers["content-length"])
                except ValueError:
                    content_length = 0
                if content_length > app_settings.assistant_request_body_limit_bytes:
                    status_code = 413
                    return JSONResponse(
                        status_code=413,
                        content={
                            "error": {
                                "code": "REQUEST_BODY_TOO_LARGE",
                                "message": "The assistant request body is too large.",
                                "request_id": request_id,
                                "issues": [],
                            }
                        },
                        headers={"X-Request-ID": request_id},
                    )

            if request.method != "OPTIONS" and request.url.path == f"{app_settings.api_v1_prefix}/assistant/chat":
                client_key = request.client.host if request.client else "unknown"
                now = time.monotonic()
                window = [
                    timestamp
                    for timestamp in assistant_windows.get(client_key, [])
                    if now - timestamp < 60
                ]
                if len(window) >= app_settings.assistant_rate_limit_per_minute:
                    status_code = 429
                    return JSONResponse(
                        status_code=429,
                        content={
                            "error": {
                                "code": "ASSISTANT_RATE_LIMIT_EXCEEDED",
                                "message": "Too many assistant requests. Please retry later.",
                                "request_id": request_id,
                                "issues": [],
                            }
                        },
                        headers={"X-Request-ID": request_id},
                    )
                window.append(now)
                assistant_windows[client_key] = window

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

    @app.get(
        "/",
        tags=["system"],
        summary="Service root index",
        response_model=ApiResponse[dict],
    )
    async def root_index(request: Request) -> ApiResponse[dict]:
        """Return service identity, status, and navigation links."""
        return ApiResponse(
            data={
                "service": app_settings.app_name,
                "status": "operational",
                "version": "0.8.0",
                "environment": app_settings.environment,
                "message": (
                    "AgriNex AI API is running. Visit /docs for interactive API documentation, "
                    "/api/v1 for API endpoints, or http://localhost:3000 for the farmer dashboard."
                ),
                "docs_url": "/docs",
                "openapi_url": f"{app_settings.api_v1_prefix}/openapi.json",
                "health_check": f"{app_settings.api_v1_prefix}/health",
                "frontend_url": "http://localhost:3000",
            },
            request_id=request.state.request_id,
        )

    @app.get(
        "/health",
        tags=["system"],
        summary="Root health check alias",
        response_model=ApiResponse[dict],
    )
    async def root_health_alias(request: Request) -> ApiResponse[dict]:
        """Root health check alias pointing to /api/v1/health."""
        return ApiResponse(
            data={"status": "ok", "service": "agrinex-api"},
            request_id=request.state.request_id,
        )

    @app.get("/favicon.ico", include_in_schema=False)
    async def favicon() -> Response:
        return Response(status_code=204)

    return app


app = create_app()
