# Architecture

AgriNex AI is a modular monorepo. Next.js provides the responsive public website; FastAPI owns request validation, provider access, and future AI orchestration. Registration, login, authentication, accounts, and user-owned records are outside the product scope. Browser clients must not call privileged providers or carry provider credentials.

The backend separates routes in `backend/app/api/`, configuration and cross-cutting behavior in `core/`, workflows in `services/`, provider interfaces in `integrations/`, and typed Pydantic contracts in `schemas/`. `create_app` wires providers, services, bounded caches, CORS, exception handlers, and request-ID middleware. Successful responses use a typed `{data, request_id}` envelope; errors use a typed `{error}` envelope. OpenAPI is available at `/docs`, `/redoc`, and `/api/v1/openapi.json`.

The API exposes `GET /api/v1/health`, `POST /api/v1/weather/forecast`, `POST /api/v1/markets/search`, and `POST /api/v1/assistant/questions`. Weather, mandi, and Gemini are `Protocol`-based provider interfaces with default adapters that return explicit 503 not-configured errors. No external requests or paid API calls are made. Provider operations have a configurable timeout and map expected provider failures to safe 502/504 errors. Weather and market responses may be cached in a bounded in-memory TTL/LRU cache with hashed request keys; AI questions are not cached. CORS uses the explicit `ALLOWED_ORIGINS` list with credentials disabled; do not replace it with a wildcard.

The Phase 02 frontend provides `/` and `/dashboard`, `/assistant`, `/weather`, `/markets`, `/crops`, `/farms`, `/advisories`, and `/settings`. Its weather, market, crop, and farm content remains illustrative demonstration data. No external source, database, AI, or voice integration is active in the frontend.

## Persistence and retrieval decision

Keep the hackathon experience account-free. Store a selected language and optional locality preference in browser-local storage if persistence is needed; optional conversation history remains local and clearable. Ask for geolocation only after an explicit user action. Do not send browser preferences or chat history to FastAPI unless a future requirement is reviewed and approved.

PostgreSQL is not currently required: live weather and mandi providers can be called or briefly cached by FastAPI, and a small curated knowledge corpus can be versioned as source files with a lightweight local retrieval index. PostgreSQL becomes a candidate if durable source-attributed observations, historical comparisons, or multi-process ingestion/query workloads are required. pgvector is an optional PostgreSQL extension for persistent vector similarity/hybrid search, not a RAG prerequisite. Adopt it only if corpus size, concurrency, metadata filtering, or retrieval evaluation demonstrates the need. No Supabase vendor or auth dependency is selected.

## Phase 03 status and limitations

The backend foundation is implemented and tested, but this is not a claim of production readiness. It returns no fabricated live weather, mandi, or AI results. The in-memory cache is process-local and is not durable or shared across workers. JSON logs use allowlisted metadata (request ID, method, matched route template, status, duration, and safe error type); request bodies, query values, IP addresses, and provider credentials are excluded. Before enabling costly providers on public endpoints, add and verify request-size limits, rate limiting, provider quotas, and abuse monitoring.
