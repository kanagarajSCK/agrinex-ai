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
