import asyncio
import hashlib
from typing import Any

from app.core.exceptions import EmbeddingProviderError
from app.rag.embedding import EmbeddingProvider
from app.rag.schemas import RetrievalFilters, RetrievalResponse, RetrievalResult
from app.rag.store import VectorStore


class RetrievalService:
    def __init__(
        self,
        embedding_provider: EmbeddingProvider,
        store: VectorStore,
        top_k: int = 5,
        relevance_threshold: float = 0.72,
        max_context_chars: int = 6000,
    ) -> None:
        self._embedding_provider = embedding_provider
        self._store = store
        self._top_k = top_k
        self._relevance_threshold = relevance_threshold
        self._max_context_chars = max_context_chars

    async def retrieve(
        self,
        query: str,
        filters: RetrievalFilters | None = None,
    ) -> RetrievalResponse:
        if not query.strip():
            return RetrievalResponse(sufficient=False, results=[], query=query)
        try:
            embedding = await asyncio.to_thread(
                self._embedding_provider.embed,
                f"task: question answering | query: {query.strip()}",
                "RETRIEVAL_QUERY",
            )
            where: dict[str, Any] | None = None
            if filters:
                raw = filters.model_dump(mode="json", exclude_none=True)
                category = raw.pop("category", None)
                where = raw
                if category:
                    where["subject"] = category
                if where.get("active") is None:
                    where.pop("active", None)
            candidates = await asyncio.to_thread(
                self._store.query,
                embedding,
                self._top_k * 2,
                where,
            )
        except EmbeddingProviderError:
            return RetrievalResponse(sufficient=False, results=[], query=query)

        seen: set[str] = set()
        results: list[RetrievalResult] = []
        context_chars = 0
        for chunk, score in candidates:
            if score < self._relevance_threshold:
                continue
            if not chunk.active:
                continue
            normalized = " ".join(chunk.text.lower().split())
            digest = hashlib.sha256(normalized[:800].encode("utf-8")).hexdigest()
            if digest in seen:
                continue
            seen.add(digest)
            if context_chars + len(chunk.text) > self._max_context_chars:
                remaining = self._max_context_chars - context_chars
                if remaining < 300:
                    break
                chunk = chunk.model_copy(
                    update={"text": chunk.text[:remaining].rstrip()},
                )
            context_chars += len(chunk.text)
            results.append(RetrievalResult(chunk=chunk, score=round(float(score), 6)))
            if len(results) >= self._top_k:
                break

        return RetrievalResponse(
            sufficient=bool(results),
            results=results,
            query=query,
        )
