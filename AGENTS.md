# AgriNex AI Agent Guide

Read this file before modifying the repository. AgriNex AI is a responsive agricultural intelligence website: start in Salem, Tamil Nadu, and scale responsibly across India. It is a public, no-account experience: farmers must be able to open the dashboard directly without registration, login, or authentication. Its purpose is understandable, evidence-based decision support—not unverified agronomic advice.

## Stack and structure

- `frontend/`: Next.js App Router, React, TypeScript strict mode, Tailwind CSS.
- `backend/`: FastAPI application with versioned REST routes at `/api/v1`.
- `database/`: reserved for database assets only if a documented product need justifies persistent storage.
- `knowledge-base/`: curated source material only; preserve provenance.
- `docs/`: architecture and operational decisions.

Use PascalCase for React components, camelCase for TypeScript values, snake_case for Python modules/functions, and descriptive feature names. Keep route handlers thin; place future business logic in `services/`, external clients in `integrations/`, and Pydantic contracts in `schemas/`.

## Security and data rules

Keep FastAPI as the backend and keep provider credentials server-side. Never hardcode, log, commit, or expose credentials. `.env` files are ignored; use placeholders in `.env.example`. Validate inbound and external data, set explicit CORS origins, and label all non-live content as demo/sample data. Request browser geolocation only after a farmer explicitly chooses the location-detection action and grants permission.

Do not add user registration, login, authentication, account management, user-owned tables, Supabase Auth, or Supabase by default. Persist only the minimum preference data and optional session history, preferably in browser-local storage with clear controls; do not send it to the backend without a separately approved need. Evaluate PostgreSQL and pgvector against concrete weather/market history and RAG requirements before proposing them. Neither is a Phase 02 prerequisite.

## Quality workflow

Run frontend lint and build plus backend tests for affected work. Add tests for changed API behavior. Maintain strict TypeScript and typed Pydantic models. Avoid destructive Git operations; inspect existing work first. Keep commits focused using conventional commit messages when committing.

## Delivery state

Phase 01 (architecture and foundation) and Phase 02 (premium responsive UI/UX) are implemented. The website includes dashboard, assistant, weather, markets, crops, farms, advisory history, and settings routes, with responsive desktop, tablet, and mobile navigation. All non-live values and farm profiles are explicitly presented as demonstration data; filters and farm edits operate only in local page state.

Phase 02 does not connect live weather or mandi providers, Gemini, RAG, speech recognition, text-to-speech, server persistence, or validated personalized advice. Language and location controls are UI previews; translations and permission-based location detection are not yet implemented. All farmers can open the website directly. The next development phase has not started; follow `docs/development-roadmap.md` and do not assume authentication or a database phase.

Phase 03 (Core Backend Architecture) is implemented: FastAPI exposes typed, versioned health, weather, market, and assistant contracts; provider protocols default to explicit not-configured errors; cached data operations use bounded in-memory TTL caching; request validation, request IDs, safe error envelopes, JSON logging, and explicit CORS are configured. Automated tests cover the core API and infrastructure. No external provider is connected, and no live weather, market, or AI data is returned. Review `docs/architecture.md`, `docs/api-specification.md`, and `docs/security.md` before extending the backend. Rate limiting and request-body size limits must be addressed before enabling public, costly provider calls.

Phase 04 (Live Weather Intelligence) uses the official public Open-Meteo Forecast API through FastAPI. The provider requests explicit current, daily, and hourly variables in Celsius, km/h, mm, and `Asia/Kolkata`. Responses are validated and cached in the existing bounded in-memory TTL/LRU cache; provider failures are mapped to safe 502/504 errors. The frontend must replace weather sample values with live values only after an API success and must preserve honest loading/error states. No mandi, AI, RAG, voice, auth, database, or other live provider functionality is part of Phase 04.
