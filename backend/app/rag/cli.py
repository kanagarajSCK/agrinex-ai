import argparse
import json

from app.core.config import get_settings
from app.rag.approved_sources import APPROVED_SOURCES
from app.rag.embedding import GoogleEmbeddingProvider
from app.rag.ingestion import KnowledgeIngestionService
from app.rag.store import ChromaVectorStore


def build_ingestion_service():
    settings = get_settings()
    store = ChromaVectorStore(settings.rag_store_path)
    embedding = GoogleEmbeddingProvider(
        api_key=settings.gemini_api_key,
        model=settings.embedding_model,
        dimensions=settings.embedding_dimensions,
        timeout_seconds=settings.gemini_timeout_seconds,
    )
    return KnowledgeIngestionService(
        embedding_provider=embedding,
        store=store,
        manifest_path=settings.rag_documents_path,
    )


def main() -> None:
    parser = argparse.ArgumentParser(description="AgriNex controlled knowledge ingestion")
    subparsers = parser.add_subparsers(dest="command", required=True)

    subparsers.add_parser("sources", help="List approved source IDs")
    subparsers.add_parser("list", help="List indexed document versions")

    ingest = subparsers.add_parser("ingest", help="Ingest an approved local PDF")
    ingest.add_argument("--source", required=True, choices=sorted(APPROVED_SOURCES))
    ingest.add_argument("--file", required=True)
    ingest.add_argument("--crop")

    remove = subparsers.add_parser("remove", help="Safely remove an incorrectly ingested document")
    remove.add_argument("--document-id", required=True)

    verify = subparsers.add_parser("verify", help="Verify manifest and vector counts")
    args = parser.parse_args()

    if args.command == "sources":
        print(json.dumps(APPROVED_SOURCES, ensure_ascii=False, indent=2))
        return

    service = build_ingestion_service()
    if args.command == "list":
        print(json.dumps([
            document.model_dump(mode="json")
            for document in service.list_documents()
        ], ensure_ascii=False, indent=2))
    elif args.command == "ingest":
        document = service.ingest(args.source, args.file, args.crop)
        print(json.dumps(document.model_dump(mode="json"), ensure_ascii=False, indent=2))
    elif args.command == "remove":
        service.remove_document_version(args.document_id)
        print(json.dumps({"removed": args.document_id}))
    elif args.command == "verify":
        store = build_ingestion_service()._store
        print(json.dumps({
            "document_count": len(store.documents()),
            "chunk_count": store.count(),
            "manifest_document_count": len(service.list_documents()),
        }))


if __name__ == "__main__":
    main()
