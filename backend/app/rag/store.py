from pathlib import Path
from typing import Any, Protocol

from app.rag.schemas import KnowledgeChunk


class VectorStore(Protocol):
    def upsert(self, chunks: list[KnowledgeChunk], embeddings: list[list[float]]) -> None: ...
    def query(
        self,
        embedding: list[float],
        top_k: int,
        filters: dict[str, Any] | None,
    ) -> list[tuple[KnowledgeChunk, float]]: ...
    def delete_document(self, document_id: str) -> None: ...
    def deactivate_document(self, document_id: str) -> None: ...
    def count(self) -> int: ...
    def documents(self) -> list[str]: ...


class InMemoryVectorStore:
    def __init__(self) -> None:
        self._chunks: dict[str, KnowledgeChunk] = {}
        self._embeddings: dict[str, list[float]] = {}

    def upsert(self, chunks: list[KnowledgeChunk], embeddings: list[list[float]]) -> None:
        if len(chunks) != len(embeddings):
            raise ValueError("Chunk and embedding counts must match")
        for chunk, embedding in zip(chunks, embeddings):
            self._chunks[chunk.chunk_id] = chunk
            self._embeddings[chunk.chunk_id] = embedding

    def query(
        self,
        embedding: list[float],
        top_k: int,
        filters: dict[str, Any] | None,
    ) -> list[tuple[KnowledgeChunk, float]]:
        def cosine(left: list[float], right: list[float]) -> float:
            if not left or len(left) != len(right):
                return 0.0
            dot = sum(a * b for a, b in zip(left, right))
            left_norm = sum(a * a for a in left) ** 0.5
            right_norm = sum(b * b for b in right) ** 0.5
            if not left_norm or not right_norm:
                return 0.0
            return dot / (left_norm * right_norm)

        results: list[tuple[KnowledgeChunk, float]] = []
        for chunk_id, chunk in self._chunks.items():
            if filters:
                metadata = {
                    "institution": chunk.institution,
                    "language": chunk.language,
                    "crop": chunk.crop,
                    "subject": chunk.subject,
                    "region": chunk.region,
                    "document_id": chunk.document_id,
                    "active": chunk.active,
                }
                if any(metadata.get(key) != value for key, value in filters.items()):
                    continue
            results.append((chunk, cosine(embedding, self._embeddings[chunk_id])))
        results.sort(key=lambda item: item[1], reverse=True)
        return results[:top_k]

    def delete_document(self, document_id: str) -> None:
        for chunk_id, chunk in list(self._chunks.items()):
            if chunk.document_id == document_id:
                del self._chunks[chunk_id]
                del self._embeddings[chunk_id]

    def deactivate_document(self, document_id: str) -> None:
        for chunk_id, chunk in list(self._chunks.items()):
            if chunk.document_id == document_id:
                self._chunks[chunk_id] = chunk.model_copy(update={"active": False})

    def count(self) -> int:
        return len(self._chunks)

    def documents(self) -> list[str]:
        return sorted({chunk.document_id for chunk in self._chunks.values()})


class ChromaVectorStore:
    def __init__(self, persist_directory: str) -> None:
        from chromadb import PersistentClient
        from chromadb.config import Settings as ChromaSettings

        Path(persist_directory).mkdir(parents=True, exist_ok=True)
        self._client = PersistentClient(
            path=persist_directory,
            settings=ChromaSettings(anonymized_telemetry=False),
        )
        self._collection = self._client.get_or_create_collection(
            name="agrinex_knowledge",
            metadata={"hnsw:space": "cosine"},
        )

    def upsert(self, chunks: list[KnowledgeChunk], embeddings: list[list[float]]) -> None:
        if not chunks:
            return
        if len(chunks) != len(embeddings):
            raise ValueError("Chunk and embedding counts must match")
        self._collection.upsert(
            ids=[chunk.chunk_id for chunk in chunks],
            embeddings=embeddings,
            documents=[chunk.text for chunk in chunks],
            metadatas=[
                {
                    "document_id": chunk.document_id,
                    "document_version": chunk.document_version,
                    "title": chunk.title,
                    "institution": chunk.institution,
                    "source_url": chunk.source_url,
                    "publication_year": chunk.publication_year or -1,
                    "language": chunk.language,
                    "subject": chunk.subject,
                    "crop": chunk.crop or "",
                    "region": chunk.region or "",
                    "page_number": chunk.page_number,
                    "page_end": chunk.page_end,
                    "active": chunk.active,
                }
                for chunk in chunks
            ],
        )

    def query(
        self,
        embedding: list[float],
        top_k: int,
        filters: dict[str, Any] | None,
    ) -> list[tuple[KnowledgeChunk, float]]:
        if top_k < 1:
            return []
        where = None
        if filters:
            conditions = [
                {key: value}
                for key, value in filters.items()
                if value is not None
            ]
            if len(conditions) == 1:
                where = conditions[0]
            elif len(conditions) > 1:
                where = {"$and": conditions}
        response = self._collection.query(
            query_embeddings=[embedding],
            n_results=top_k,
            where=where,
            include=["documents", "metadatas", "distances"],
        )
        ids = (response.get("ids") or [[]])[0]
        documents = (response.get("documents") or [[]])[0]
        metadatas = (response.get("metadatas") or [[]])[0]
        distances = (response.get("distances") or [[]])[0]
        results: list[tuple[KnowledgeChunk, float]] = []
        for index, chunk_id in enumerate(ids):
            if index >= len(documents) or index >= len(metadatas):
                continue
            metadata = metadatas[index]
            distance = distances[index] if index < len(distances) else 1.0
            chunk = KnowledgeChunk(
                chunk_id=str(chunk_id),
                document_id=str(metadata["document_id"]),
                document_version=str(metadata["document_version"]),
                title=str(metadata["title"]),
                institution=str(metadata["institution"]),
                source_url=str(metadata["source_url"]),
                publication_year=(
                    int(metadata["publication_year"])
                    if int(metadata["publication_year"]) > 0
                    else None
                ),
                language=str(metadata["language"]),
                subject=str(metadata["subject"]),
                crop=str(metadata["crop"]) or None,
                region=str(metadata["region"]) or None,
                page_number=int(metadata["page_number"]),
                page_end=int(metadata["page_end"]),
                heading=None,
                text=str(documents[index]),
                checksum=str(chunk_id),
                active=bool(metadata.get("active", True)),
            )
            similarity = max(0.0, min(1.0, 1.0 - float(distance)))
            results.append((chunk, similarity))
        return results

    def delete_document(self, document_id: str) -> None:
        self._collection.delete(where={"document_id": document_id})

    def deactivate_document(self, document_id: str) -> None:
        response = self._collection.get(
            where={"document_id": document_id},
            include=["metadatas"],
        )
        ids = response.get("ids") or []
        metadatas = response.get("metadatas") or []
        for chunk_id, metadata in zip(ids, metadatas):
            if isinstance(metadata, dict):
                updated = dict(metadata)
                updated["active"] = False
                self._collection.update(ids=[chunk_id], metadatas=[updated])

    def count(self) -> int:
        return int(self._collection.count())

    def documents(self) -> list[str]:
        response = self._collection.get(include=["metadatas"])
        metadatas = response.get("metadatas") or []
        return sorted({
            str(metadata["document_id"])
            for metadata in metadatas
            if isinstance(metadata, dict) and metadata.get("document_id")
        })
