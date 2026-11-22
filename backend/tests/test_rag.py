import asyncio
import json
import tempfile
from datetime import datetime
from pathlib import Path
from zoneinfo import ZoneInfo

import pytest

from app.rag.embedding import DeterministicEmbeddingProvider
from app.rag.ingestion import KnowledgeIngestionService, chunk_pages
from app.rag.retrieval import RetrievalService
from app.rag.schemas import DocumentMetadata, KnowledgeRetrieveRequest, KnowledgeChunk, RetrievalFilters
from app.rag.store import InMemoryVectorStore


def metadata(document_id: str = "tnau-agriculture-2020") -> DocumentMetadata:
    return DocumentMetadata(
        document_id=document_id,
        title="TNAU Crop Production Guide",
        institution="Tamil Nadu Agricultural University",
        source_url="https://agritech.tnau.ac.in/ta/pdf/AGRICULTURE.pdf",
        publication_year=2020,
        document_version="2020",
        language="ta",
        subject="Agriculture",
        region="Tamil Nadu",
        page_count=2,
        content_checksum="a" * 64,
        ingestion_timestamp=datetime.now(ZoneInfo("Asia/Kolkata")),
        verification_status="verified",
        usage_permission_status="review_required",
    )


def test_chunking_preserves_page_and_metadata() -> None:
    document = metadata()
    chunks = chunk_pages(
        ["Introduction\n\nRice requires field preparation.", "Soil and irrigation table:\nA | B"],
        document,
        chunk_size=500,
        overlap=50,
    )
    assert len(chunks) >= 2
    assert chunks[0].page_number == 1
    assert chunks[0].institution == "Tamil Nadu Agricultural University"
    assert chunks[-1].page_number == 2


def test_duplicate_document_detection(monkeypatch) -> None:
    from app.rag import ingestion

    ingestion.APPROVED_SOURCES["tnau-agriculture-2020"]["usage_permission_status"] = "approved"

    temporary = tempfile.TemporaryDirectory()
    path = Path(temporary.name) / "approved.pdf"
    path.write_bytes(b"%PDF-1.4 mock")

    monkeypatch.setattr(
        ingestion,
        "extract_pdf_pages",
        lambda _: ["Page one text " * 20, "Page two text " * 20],
    )
    store = InMemoryVectorStore()
    service = KnowledgeIngestionService(
        embedding_provider=DeterministicEmbeddingProvider(768),
        store=store,
        manifest_path=str(Path(temporary.name) / "documents.json"),
    )
    first = service.ingest("tnau-agriculture-2020", str(path))
    second = service.ingest("tnau-agriculture-2020", str(path))
    assert first.content_checksum == second.content_checksum
    assert len(service.list_documents()) == 1
    temporary.cleanup()


def test_document_version_update_deactivates_old(monkeypatch) -> None:
    from app.rag import ingestion

    ingestion.APPROVED_SOURCES["tnau-agriculture-2020"]["usage_permission_status"] = "approved"

    temporary = tempfile.TemporaryDirectory()
    path = Path(temporary.name) / "approved.pdf"
    path.write_bytes(b"%PDF-1.4 mock")
    pages = iter([
        ["Page one " * 20],
        ["Updated page " * 20],
    ])
    monkeypatch.setattr(ingestion, "extract_pdf_pages", lambda _: next(pages))

    store = InMemoryVectorStore()
    service = KnowledgeIngestionService(
        embedding_provider=DeterministicEmbeddingProvider(768),
        store=store,
        manifest_path=str(Path(temporary.name) / "documents.json"),
    )
    service.ingest("tnau-agriculture-2020", str(path))
    service.ingest("tnau-agriculture-2020", str(path))

    manifest = json.loads((Path(temporary.name) / "documents.json").read_text())
    assert len([item for item in manifest if item["document_id"] == "tnau-agriculture-2020"]) == 2
    assert sum(bool(item["active"]) for item in manifest) == 1
    temporary.cleanup()


def test_retrieval_empty_and_threshold() -> None:
    provider = DeterministicEmbeddingProvider(768)
    store = InMemoryVectorStore()

    async def scenario() -> None:
        retrieval = RetrievalService(
            provider,
            store,
            top_k=5,
            relevance_threshold=0.99,
        )
        result = await retrieval.retrieve("What is the field guidance?")
        assert result.sufficient is False
        assert result.results == []

    asyncio.run(scenario())


def test_retrieval_metadata_filter_and_citation_data() -> None:
    chunk = KnowledgeChunk(
        chunk_id="chunk-1",
        document_id="tnau-agriculture-2020",
        document_version="2020",
        title="TNAU Crop Production Guide",
        institution="Tamil Nadu Agricultural University",
        source_url="https://agritech.tnau.ac.in/ta/pdf/AGRICULTURE.pdf",
        publication_year=2020,
        language="ta",
        subject="Agriculture",
        region="Tamil Nadu",
        page_number=3,
        page_end=3,
        text="Field preparation is described on this page.",
        checksum="b" * 64,
    )
    provider = DeterministicEmbeddingProvider(768)
    store = InMemoryVectorStore()
    embedding = provider.embed(chunk.text, "RETRIEVAL_DOCUMENT")
    store.upsert([chunk], [embedding])

    async def scenario() -> None:
        retrieval = RetrievalService(provider, store, top_k=5, relevance_threshold=-1.0)
        result = await retrieval.retrieve(
            "field preparation",
            RetrievalFilters(institution="Tamil Nadu Agricultural University"),
        )
        assert result.sufficient is True
        found = result.results[0].chunk
        assert found.document_id == "tnau-agriculture-2020"
        assert found.page_number == 3
        assert found.source_url.startswith("https://")

    asyncio.run(scenario())


def test_invalid_retrieval_request() -> None:
    with pytest.raises(Exception):
        KnowledgeRetrieveRequest(query="")
