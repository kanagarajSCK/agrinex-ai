# Security Baseline

AgriNex AI is a public, no-account website. Registration, login, authentication, user accounts, and user-owned records are not required. Do not add Supabase Auth or account tables.

Secrets are environment variables and are never committed, returned by APIs, or shipped to the frontend. Keep future AI and provider credentials in the FastAPI environment only. API CORS is an explicit environment-derived allowlist. Validate requests with FastAPI/Pydantic and validate external responses before presenting or caching them.

Request browser geolocation only after a farmer explicitly chooses location detection, explain its use, and handle denial gracefully. Manual location entry must remain available. Keep preferences and optional session history in browser-local storage by default, avoid sensitive content, and provide clear/delete controls if history is added. Do not transmit local history to the backend without a reviewed requirement.

Because backend endpoints are public, define appropriate request-size limits, rate limits, timeouts, provider quotas, and abuse monitoring before enabling costly integrations. If a database is later justified, use least-privilege service access and store only required operational/source data; no user-row RLS design is needed for the current account-free scope. This baseline is not a compliance or production-readiness claim.
