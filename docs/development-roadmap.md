# Development Roadmap

- [x] Phase 01 — Architecture and project foundation.
- [x] Phase 02 — Premium responsive UI/UX.
- [x] Phase 03 — Core FastAPI backend architecture.
- [ ] Phase 04 — Verified weather and mandi data integrations.
- [ ] Phase 05 — AI agricultural question workflow through FastAPI.
- [ ] Phase 06 — Curated agricultural RAG and source citations.
- [ ] Phase 07 — Reviewed multilingual content and language workflows.
- [ ] Phase 08 — Permission-based location and farm context.
- [ ] Phase 09 — Voice interaction UI and speech services.
- [ ] Phase 10 — Evidence-based, bounded agricultural recommendations.
- [ ] Phase 11 — Evaluation, privacy, security and deployment readiness.

Phase 01 includes the skeleton, responsive demo shell, health API, test, configuration template, and documentation. Phase 02 includes the responsive dashboard and seven feature routes, local demo-data interactions, reusable UI and responsive charts. It does not connect live providers, accounts, databases, AI, voice, or validated agricultural guidance. All values are illustrative and labelled as demonstration content.

Phase 03 provides typed API schemas and routes for health, weather, markets, and assistant questions; provider protocols with explicit not-configured defaults; service-layer provider timeouts; bounded in-memory TTL/LRU caching for weather and market results; consistent success/error envelopes; request-ID middleware; minimized JSON logging; explicit CORS; and automated tests. No provider is connected and no live or paid external request is made. Rate limiting and request-body size limits remain prerequisites before activating public integrations.

## Product and data scope

- The website is public and opens directly to the dashboard. Registration, login, authentication, user accounts, and account-management features are not required and must not be added to future plans.
- Keep FastAPI as the backend for provider integrations, validation, and AI orchestration. Do not select Supabase by default.
- Farmers may select a language, enter a location, or explicitly request browser location detection; ask for browser permission only after that action. The current language and location controls are previews.
- Any persistence for preferences or optional conversation history should be minimal and browser-local by default, with a way to clear it. Do not create user/profile/farm account tables.
- No PostgreSQL or pgvector phase is currently approved. Revisit PostgreSQL only if durable, queryable, source-attributed weather/market history or operational requirements justify it. Revisit pgvector only if RAG evaluation needs a durable server-side vector index; curated source files and a small local retrieval index may be sufficient for the hackathon. RAG requires embeddings and retrieval, but not PostgreSQL or pgvector specifically.

Phases 04–11 are planned only; implementation has not started. Define acceptance criteria and data-source provenance before beginning a phase. Phase 03 does not authorize implementation of the next phase.
