# Storage and Retrieval Decision

## Current decision

No database is approved or required for the hackathon UI. AgriNex AI is a public, account-free website. Do not create authentication, user, farmer-profile, farm-ownership, or account tables. Phase 02 farm cards remain local demonstration state.

If preference persistence is needed, store only the selected language and optional locality in browser-local storage. Conversation history is optional, local-only, and clearable. Avoid collecting sensitive information or sending these values to FastAPI by default.

## PostgreSQL

PostgreSQL is not a requirement for the initial weather, mandi, or RAG experiences:

- FastAPI can call validated weather and market providers and use a short-lived in-memory cache for repeated requests.
- Historical market comparisons or durable source-attributed observations may justify a database if the product needs long-term queryable history or ingestion beyond a cache.
- A small, version-controlled TNAU/ICAR knowledge corpus can be indexed locally for a hackathon RAG prototype.

Reconsider PostgreSQL only when durable observations, source/version auditing, multi-process ingestion, or query scale cannot be handled simply. If selected, use tables based on actual needs, such as `weather_observations`, `market_prices`, `knowledge_documents`, and `knowledge_chunks`. These are not user-owned records and do not require account ownership or RLS policies.

## pgvector and RAG

RAG requires curated content, embeddings, retrieval, and source citations; it does not inherently require PostgreSQL or pgvector. A small corpus can use a generated local vector index or another lightweight retrieval implementation.

Consider pgvector only if evaluation shows a need for a durable shared vector index, SQL metadata filtering/hybrid retrieval, concurrent ingestion, or larger corpus operations—and only if PostgreSQL has independently been justified. Do not select Supabase or add pgvector merely to begin RAG.

All knowledge chunks must retain source URL, publisher, usage/license status, retrieval date, content version/hash, and document-to-chunk provenance. Retrieval must return source attribution to the answer workflow.
