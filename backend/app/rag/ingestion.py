import hashlib
import json
from datetime import datetime
from pathlib import Path
from zoneinfo import ZoneInfo

from app.rag.approved_sources import APPROVED_SOURCES
from app.rag.embedding import EmbeddingProvider
from app.rag.schemas import DocumentMetadata, KnowledgeChunk
from app.rag.store import VectorStore


MAX_PDF_BYTES = 25 * 1024 * 1024


def extract_pdf_pages(path: Path) -> list[str]:
    if not path.exists() or not path.is_file():
        raise ValueError("Approved PDF file does not exist")
    if path.suffix.lower() != ".pdf":
        raise ValueError("Only PDF documents are accepted")
    if path.stat().st_size > MAX_PDF_BYTES:
        raise ValueError("PDF exceeds the 25 MB ingestion limit")
    if path.stat().st_size == 0:
        raise ValueError("PDF is empty")

    from pypdf import PdfReader

    reader = PdfReader(str(path), strict=True)
    pages: list[str] = []
    for page in reader.pages:
        text = page.extract_text() or ""
        pages.append(text.strip())
    if not pages or sum(len(text) for text in pages) < 100:
        raise ValueError("PDF text extraction is empty or clearly incomplete")
    if sum(len(text) for text in pages) > 30 * 1024 * 1024:
        raise ValueError("Extracted PDF text is too large")
    return pages


def chunk_pages(
    pages: list[str],
    metadata: DocumentMetadata,
    chunk_size: int = 1200,
    overlap: int = 150,
) -> list[KnowledgeChunk]:
    chunks: list[KnowledgeChunk] = []
    for page_number, page_text in enumerate(pages, start=1):
        if not page_text:
            continue
        paragraphs = [
            paragraph.strip()
            for paragraph in page_text.replace("\r\n", "\n").split("\n\n")
            if paragraph.strip()
        ]
        if not paragraphs:
            paragraphs = [page_text]

        buffer = ""
        part_count = 0
        for paragraph in paragraphs:
            if len(buffer) + len(paragraph) + 2 <= chunk_size:
                buffer = f"{buffer}\n\n{paragraph}".strip()
                continue
            if buffer:
                part_count += 1
                chunks.append(_make_chunk(
                    metadata,
                    page_number,
                    page_number,
                    buffer,
                    part_count,
                ))
                buffer = buffer[-overlap:].strip() if overlap else ""
            if len(paragraph) <= chunk_size:
                buffer = f"{buffer}\n\n{paragraph}".strip()
            else:
                start = 0
                while start < len(paragraph):
                    end = min(start + chunk_size, len(paragraph))
                    piece = paragraph[start:end].strip()
                    if piece:
                        part_count += 1
                        chunks.append(_make_chunk(
                            metadata,
                            page_number,
                            page_number,
                            piece,
                            part_count,
                        ))
                    start = end - overlap if overlap and end < len(paragraph) else end
                buffer = ""
        if buffer:
            part_count += 1
            chunks.append(_make_chunk(
                metadata,
                page_number,
                page_number,
                buffer,
                part_count,
            ))
    return chunks


def _make_chunk(
    metadata: DocumentMetadata,
    page_number: int,
    page_end: int,
    text: str,
    part_count: int,
) -> KnowledgeChunk:
    heading = None
    lines = [line.strip() for line in text.splitlines() if line.strip()]
    if lines and len(lines[0]) <= 120:
        heading = lines[0]
    checksum = hashlib.sha256(text.encode("utf-8")).hexdigest()
    return KnowledgeChunk(
        chunk_id=f"{metadata.document_id}:{metadata.document_version}:{page_number}:{part_count}:{checksum[:12]}",
        document_id=metadata.document_id,
        document_version=metadata.document_version,
        title=metadata.title,
        institution=metadata.institution,
        source_url=metadata.source_url,
        publication_year=metadata.publication_year,
        language=metadata.language,
        subject=metadata.subject,
        crop=metadata.crop,
        region=metadata.region,
        page_number=page_number,
        page_end=page_end,
        heading=heading,
        text=text,
        checksum=checksum,
        active=True,
    )


class KnowledgeIngestionService:
    def __init__(
        self,
        embedding_provider: EmbeddingProvider,
        store: VectorStore,
        manifest_path: str,
    ) -> None:
        self._embedding_provider = embedding_provider
        self._store = store
        self._manifest_path = Path(manifest_path)
        self._manifest_path.parent.mkdir(parents=True, exist_ok=True)

    def list_documents(self) -> list[DocumentMetadata]:
        return [DocumentMetadata.model_validate(item) for item in self._read_manifest()]

    def ingest(
        self,
        source_id: str,
        pdf_path: str,
        crop: str | None = None,
    ) -> DocumentMetadata:
        if source_id not in APPROVED_SOURCES:
            raise ValueError("Source is not in the approved source registry")
        source = APPROVED_SOURCES[source_id]
        if source["usage_permission_status"] != "approved":
            raise ValueError(
                "Source usage permission requires manual review before ingestion"
            )
        path = Path(pdf_path).resolve()
        if not path.exists():
            raise ValueError("Approved PDF file does not exist")
        if path.stat().st_size > MAX_PDF_BYTES:
            raise ValueError("PDF exceeds the 25 MB ingestion limit")

        pages = extract_pdf_pages(path)
        content = "\n\n".join(pages).encode("utf-8")
        checksum = hashlib.sha256(content).hexdigest()
        manifest = self._read_manifest()

        existing = next(
            (
                item
                for item in manifest
                if item.get("document_id") == source_id
                and item.get("content_checksum") == checksum
                and item.get("active") is True
            ),
            None,
        )
        if existing:
            return DocumentMetadata.model_validate(existing)

        old = [
            item
            for item in manifest
            if item.get("document_id") == source_id
            and item.get("active") is True
        ]
        for item in old:
            item["active"] = False
        self._store.deactivate_document(source_id)

        document_id = source_id
        document_version = str(source["document_version"])
        metadata = DocumentMetadata(
            document_id=document_id,
            title=str(source["title"]),
            institution=str(source["institution"]),
            source_url=str(source["source_url"]),
            publication_year=int(source["publication_year"]),
            document_version=document_version,
            language=str(source["language"]),
            subject=str(source["subject"]),
            crop=crop,
            region=str(source["region"]),
            page_count=len(pages),
            content_checksum=checksum,
            ingestion_timestamp=datetime.now(ZoneInfo("Asia/Kolkata")),
            verification_status="verified",
            usage_permission_status=str(source["usage_permission_status"]),
            active=True,
        )

        chunks = chunk_pages(pages, metadata)
        if not chunks:
            raise ValueError("No validated chunks could be generated")
        embeddings = [
            self._embedding_provider.embed(
                f"title: {chunk.title} | text: {chunk.text}",
                "RETRIEVAL_DOCUMENT",
            )
            for chunk in chunks
        ]
        if any(len(vector) == 0 for vector in embeddings):
            raise ValueError("Embedding provider returned an empty vector")
        self._store.upsert(chunks, embeddings)

        manifest.append(metadata.model_dump(mode="json"))
        self._write_manifest(manifest)
        return metadata

    def remove_document_version(self, document_id: str) -> None:
        manifest = self._read_manifest()
        remaining = [item for item in manifest if item.get("document_id") != document_id]
        self._write_manifest(remaining)
        self._store.delete_document(document_id)

    def _read_manifest(self) -> list[dict]:
        if not self._manifest_path.exists():
            return []
        try:
            value = json.loads(self._manifest_path.read_text(encoding="utf-8"))
        except json.JSONDecodeError as exc:
            raise ValueError("Knowledge document manifest is invalid") from exc
        return value if isinstance(value, list) else []

    def _write_manifest(self, manifest: list[dict]) -> None:
        temporary = self._manifest_path.with_suffix(".tmp")
        temporary.write_text(
            json.dumps(manifest, ensure_ascii=False, indent=2),
            encoding="utf-8",
        )
        temporary.replace(self._manifest_path)
