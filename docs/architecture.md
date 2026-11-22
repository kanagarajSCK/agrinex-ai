# Architecture

AgriNex AI is a modular monorepo. Next.js provides the responsive public website; FastAPI owns request validation, provider access, and future AI orchestration. Registration, login, authentication, accounts, and user-owned records are outside the product scope. Browser clients must not call privileged providers or carry provider credentials.

The backend separates routes in `backend/app/api/`, configuration and cross-cutting behavior in `core/`, workflows in `services/`, provider interfaces in `integrations/`, and typed Pydantic contracts in `schemas/`. `create_app` wires providers, services, bounded caches, CORS, exception handlers, and request-ID middleware. Successful responses use a typed `{data, request_id}` envelope; errors use a typed `{error}` envelope. OpenAPI is available at `/docs`, `/redoc`, and `/api/v1/openapi.json`.

The API exposes `GET /api/v1/health`, `GET /api/v1/weather/current`, `GET /api/v1/weather/forecast`, `GET /api/v1/weather/hourly`, `POST /api/v1/markets/search`, and `POST /api/v1/assistant/questions`. The weather provider is the public official Open-Meteo Forecast API. Mandi and Gemini remain `Protocol`-based providers with explicit not-configured responses. Provider operations have a configurable timeout and map expected failures to safe 502/504 errors. Weather responses are cached in a bounded in-memory TTL/LRU cache with hashed coordinate/request keys; failed provider responses are never cached. CORS uses the explicit `ALLOWED_ORIGINS` list with credentials disabled; do not replace it with a wildcard.

Open-Meteo requests use `latitude`, `longitude`, `forecast_days=1-7`, `timezone=Asia/Kolkata`, Celsius, km/h, mm, and only the required current/daily/hourly variables. The response is parsed into typed Pydantic models and attributed to Open-Meteo with a retrieval timestamp. The provider host is fixed by configuration validation to `https://api.open-meteo.com`; arbitrary or user-controlled hosts are not accepted.

## Phase 05 market provider

Phase 05 uses the official data.gov.in AGMARKNET resource `9ef84268-d588-465a-a308-a864a43d0070` on `https://api.data.gov.in`. An authorized `DATA_GOV_IN_API_KEY` is mandatory and remains in the FastAPI environment. The provider uses server-side fixed filters and bounded pagination, validates arrival dates and decimal prices, and normalizes only rupees-per-quintal records. Missing, malformed, or cross-unit records are rejected rather than corrected or filled. No stale successful response is used to replace a failed upstream call; cache entries are valid for 900 seconds and identify old arrival dates explicitly.

The Phase 02 frontend provides `/` and `/dashboard`, `/assistant`, `/weather`, `/markets`, `/crops`, `/farms`, `/advisories`, and `/settings`. Its weather, market, crop, and farm content remains illustrative demonstration data. No external source, database, AI, or voice integration is active in the frontend.

## Persistence and retrieval decision

Keep the hackathon experience account-free. Store a selected language and optional locality preference in browser-local storage if persistence is needed; optional conversation history remains local and clearable. Ask for geolocation only after an explicit user action. Do not send browser preferences or chat history to FastAPI unless a future requirement is reviewed and approved.

PostgreSQL is not currently required: live weather and mandi providers can be called or briefly cached by FastAPI, and a small curated knowledge corpus can be versioned as source files with a lightweight local retrieval index. PostgreSQL becomes a candidate if durable source-attributed observations, historical comparisons, or multi-process ingestion/query workloads are required. pgvector is an optional PostgreSQL extension for persistent vector similarity/hybrid search, not a RAG prerequisite. Adopt it only if corpus size, concurrency, metadata filtering, or retrieval evaluation demonstrates the need. No Supabase vendor or auth dependency is selected.

## Phase 03 status and limitations

The backend foundation is implemented and tested, but this is not a claim of production readiness. It returns no fabricated live weather, mandi, or AI results. The in-memory cache is process-local and is not durable or shared across workers. JSON logs use allowlisted metadata (request ID, method, matched route template, status, duration, and safe error type); request bodies, query values, IP addresses, and provider credentials are excluded. Before enabling costly providers on public endpoints, add and verify request-size limits, rate limiting, provider quotas, and abuse monitoring.
