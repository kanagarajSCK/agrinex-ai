# AgriNex AI

**Smarter Farming. Better Decisions.** AgriNex AI is a responsive agricultural intelligence website for Indian farmers, beginning with Salem, Tamil Nadu. It is a public, no-account experience: the website opens directly to the dashboard with no registration, login, or authentication. Phase 02 provides a clearly labelled demonstration experience; it does not provide live farm data or agricultural advice.

## Roadmap

Phase 01 (foundation) and Phase 02 (premium responsive UI/UX) are complete. Future phases cover verified weather and mandi data, AI-assisted questions, curated agricultural RAG, multilingual content, voice, and evidence-based recommendations. User accounts and authentication are not part of the product scope. See [the roadmap](docs/development-roadmap.md).

Product scope: farmers can select a language, enter their farm location or explicitly request browser location detection, ask agricultural questions, check weather and mandi prices, receive cited AI-assisted recommendations, and use voice features when implemented. Location detection must request permission only after the farmer chooses it. Preferences and optional session history should use minimal browser-local storage by default.

## Phase 02 website

The frontend includes these routes:

- `/` and `/dashboard` — farm overview dashboard
- `/assistant` — local chat interface preview; no AI request is sent
- `/weather` — sample current conditions and seven-day charts
- `/markets` — searchable, filterable sample market-price comparison
- `/crops` — searchable crop information placeholders
- `/farms` — editable local sample farm cards; no GPS or persistence
- `/advisories` — filterable, expandable sample advisory history
- `/settings` — local language and preference controls

Every displayed weather, market, location, crop, and profile value is demonstration data. Language, notifications, search, filters, and farm editing are frontend-only controls. No provider, database, authentication, or voice functionality is connected. Future browser location detection must be user-initiated and permission-based. Preference persistence and optional session history should remain local to the browser unless a concrete requirement establishes otherwise.

## Architecture

Next.js provides the responsive web UI. FastAPI owns provider access, request validation, and future AI orchestration through typed, versioned API endpoints. Phase 04 connects only the official Open-Meteo public forecast provider. Mandi and Gemini providers remain unconnected. No database or hosted backend vendor is selected. PostgreSQL may be considered for durable source-attributed weather/market history or operational needs; pgvector may be considered for a larger, persistent RAG index. Neither is required for the current hackathon scope. Read [architecture](docs/architecture.md), [API specification](docs/api-specification.md), [storage decision](docs/database-design.md), and [security baseline](docs/security.md).

## Repository structure

```text
frontend/        Next.js application
backend/         FastAPI application and tests
database/        Reserved; no database selected
knowledge-base/  Reserved curated TNAU/ICAR source material
docs/            Product and technical decisions
```

## Prerequisites (Windows)

Node.js 22+ and Python 3.11+ are recommended. This foundation was created with Node 25.8.0 and Python 3.14.6.

### Frontend

```powershell
cd frontend
npm install
npm run dev
```

Open `http://localhost:3000`. Validate with `npm run lint` and `npm run build`.

### Backend

```powershell
cd backend
py -3.14 -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

The health endpoint is `http://localhost:8000/api/v1/health`. Interactive OpenAPI docs are at `http://localhost:8000/docs`; the versioned schema is at `http://localhost:8000/api/v1/openapi.json`. Run tests with `pytest` from `backend/`.

## Environment configuration

Copy `.env.example` to `backend/.env` and set only needed values. `ALLOWED_ORIGINS` must be a JSON list of explicit HTTP(S) origins; wildcards are rejected. Provider timeouts, in-memory cache TTL/capacity, and log level are configurable. No provider credentials are currently required because no external integration is configured. Never commit `.env` or expose future provider credentials to browser code. Supabase credentials are not required or configured.

## Current status and limitations

Phases 01–04 are complete. Phase 04 provides live Open-Meteo weather for coordinates through FastAPI and honest frontend loading/error states; Salem coordinates are only a demo default. The application has no connected mandi or AI provider, database, RAG, translated content, or voice functionality. Location detection remains browser-initiated and permission-based. There is no registration, login, authentication, or user-account management. Market and advisory content remains demonstration data and is not verified agronomic guidance.
