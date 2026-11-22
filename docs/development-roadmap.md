# Development Roadmap

- [x] Phase 01 — Architecture and project foundation.
- [x] Phase 02 — Premium responsive UI/UX.
- [ ] Phase 03 — Verified weather and mandi data integrations.
- [ ] Phase 04 — AI agricultural question workflow through FastAPI.
- [ ] Phase 05 — Curated agricultural RAG and source citations.
- [ ] Phase 06 — Reviewed multilingual content and language workflows.
- [ ] Phase 07 — Permission-based location and farm context.
- [ ] Phase 08 — Voice interaction UI and speech services.
- [ ] Phase 09 — Evidence-based, bounded agricultural recommendations.
- [ ] Phase 10 — Evaluation, privacy, security and deployment readiness.

Phase 01 includes the skeleton, responsive demo shell, health API, test, configuration template, and documentation. Phase 02 includes the responsive dashboard and seven feature routes, local demo-data interactions, reusable UI and responsive charts. It does not connect live providers, accounts, databases, AI, voice, or validated agricultural guidance. All values are illustrative and labelled as demonstration content.

## Product and data scope

- The website is public and opens directly to the dashboard. Registration, login, authentication, user accounts, and account-management features are not required and must not be added to future plans.
- Keep FastAPI as the backend for provider integrations, validation, and AI orchestration. Do not select Supabase by default.
- Farmers may select a language, enter a location, or explicitly request browser location detection; ask for browser permission only after that action. The current language and location controls are previews.
- Any persistence for preferences or optional conversation history should be minimal and browser-local by default, with a way to clear it. Do not create user/profile/farm account tables.
- No PostgreSQL or pgvector phase is currently approved. Revisit PostgreSQL only if durable, queryable, source-attributed weather/market history or operational requirements justify it. Revisit pgvector only if RAG evaluation needs a durable server-side vector index; curated source files and a small local retrieval index may be sufficient for the hackathon. RAG requires embeddings and retrieval, but not PostgreSQL or pgvector specifically.

Phases 03–10 are planned only; implementation has not started. Define acceptance criteria and data-source provenance before beginning a phase.
