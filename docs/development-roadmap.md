# Development Roadmap

- [x] Phase 01 — Architecture and project foundation.
- [x] Phase 02 — Premium responsive UI/UX.
- [x] Phase 03 — Core FastAPI backend architecture.
- [x] Phase 04 — Live weather intelligence through the official Open-Meteo API.
- [x] Phase 05 — Genuine mandi market intelligence foundation through AGMARKNET/data.gov.in.
- [x] Phase 06 — Gemini agricultural assistant and controlled verified-data tools.
- [x] Phase 07 — Agricultural knowledge base and source-grounded RAG foundation.
- [ ] Phase 08 — Reviewed multilingual content and language workflows.
- [ ] Phase 09 — Permission-based location and farm context.
- [ ] Phase 10 — Voice interaction UI and speech services.
- [ ] Phase 11 — Evidence-based, bounded agricultural recommendations.
- [ ] Phase 12 — Evaluation, privacy, security and deployment readiness.

Phase 01 includes the skeleton, responsive demo shell, health API, test, configuration template, and documentation. Phase 02 includes the responsive dashboard and seven feature routes, local demo-data interactions, reusable UI and responsive charts. It does not connect live providers, accounts, databases, AI, voice, or validated agricultural guidance. All values are illustrative and labelled as demonstration content.

Phase 03 provides typed API schemas and routes for health, weather, markets, and assistant questions; provider protocols with explicit not-configured defaults; service-layer provider timeouts; bounded in-memory TTL/LRU caching for weather and market results; consistent success/error envelopes; request-ID middleware; minimized JSON logging; explicit CORS; and automated tests. No provider is connected and no live or paid external request is made. Rate limiting and request-body size limits remain prerequisites before activating public integrations.

Phase 04 replaces Open-Meteo's prior unconfigured weather adapter with a typed public API provider, adds coordinate-based current/forecast/hourly routes, and connects the weather and dashboard pages to successful live responses. It does not infer agricultural actions or substitute demo values for failed live requests.

Phase 05 implements the AGMARKNET/data.gov.in provider architecture, typed normalized records, market filters, summary/calculation routes, UI loading/error states, and a 900-second cache. Completion of genuine live records depends on a valid server-side API key and upstream reporting availability; no live key or successful upstream dataset is assumed.

Phase 06 implements Gemini chat through the maintained `google-genai` SDK, structured assistant responses, Tamil/Telugu/Hindi/English support, bounded history, weather/mandi tool allowlisting, safe provider errors, body/rate limits and the responsive assistant UI. Live Gemini success remains dependent on a server-side key and available quota.

Phase 07 implements approved TNAU source registration, controlled PDF ingestion, page-aware chunks, duplicate/content-hash detection, version preservation, `gemini-embedding-001` embeddings, a replaceable vector-store interface, local Chroma storage, relevance-bounded retrieval and trusted citation metadata. No actual approved PDF has been ingested or live embedding retrieval verified yet.

## Product and data scope

- The website is public and opens directly to the dashboard. Registration, login, authentication, user accounts, and account-management features are not required and must not be added to future plans.
- Keep FastAPI as the backend for provider integrations, validation, and AI orchestration. Do not select Supabase by default.
- Farmers may select a language, enter a location, or explicitly request browser location detection; ask for browser permission only after that action. The current language and location controls are previews.
- Any persistence for preferences or optional conversation history should be minimal and browser-local by default, with a way to clear it. Do not create user/profile/farm account tables.
- No PostgreSQL or pgvector phase is currently approved. Revisit PostgreSQL only if durable, queryable, source-attributed weather/market history or operational requirements justify it. Revisit pgvector only if RAG evaluation needs a durable server-side vector index; curated source files and a small local retrieval index may be sufficient for the hackathon. RAG requires embeddings and retrieval, but not PostgreSQL or pgvector specifically.

Phases 08–12 are planned only; implementation has not started. Define acceptance criteria and data-source provenance before beginning a phase. Phase 07 does not authorize voice or persistent memory.
