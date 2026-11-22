# Architecture

AgriNex AI is a modular monorepo. The Next.js frontend provides the responsive web experience; the FastAPI backend owns business rules, provider access, validation, and future AI orchestration. The product is public and does not require user registration, login, authentication, or accounts. Browser clients must not call privileged providers or carry provider credentials.

The frontend uses server/client boundaries deliberately and calls versioned backend APIs. The backend keeps routes in `api/`, configuration and cross-cutting handling in `core/`, business workflows in `services/`, provider clients in `integrations/`, and Pydantic contracts in `schemas/`. Future RAG ingestion will use curated documents, chunk metadata, embeddings, and retrieval citations.

Current API boundary: `GET /api/v1/health`. CORS uses `ALLOWED_ORIGINS`; do not replace it with a wildcard.

The Phase 02 frontend provides `/` and `/dashboard`, `/assistant`, `/weather`, `/markets`, `/crops`, `/farms`, `/advisories`, and `/settings`. Shared App Router layout provides responsive desktop, tablet, and mobile navigation. Weather and market charts, crop cards, and farm profiles are illustrative demonstration content. Search, filters, selectors, and farm editing operate only in local page state. No external data source, database, AI, or voice integration is active. User-facing content must continue to identify all sample values, and crop/advisory views must not imply unverified agronomic guidance.

## Persistence and retrieval decision

Keep the hackathon experience account-free. Store a selected language and optional locality preference in browser-local storage if persistence is needed; optional conversation history remains local and clearable. Ask for geolocation only after an explicit user action. Do not send browser preferences or chat history to FastAPI unless a future requirement is reviewed and approved.

PostgreSQL is not currently required: live weather and mandi providers can be called or briefly cached by FastAPI, and a small curated knowledge corpus can be versioned as source files with a lightweight local retrieval index. PostgreSQL becomes a candidate if durable source-attributed observations, historical comparisons, or multi-process ingestion/query workloads are required. pgvector is an optional PostgreSQL extension for persistent vector similarity/hybrid search, not a RAG prerequisite. Adopt it only if corpus size, concurrency, metadata filtering, or retrieval evaluation demonstrates the need. No Supabase vendor or auth dependency is selected.
