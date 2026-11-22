from fastapi import APIRouter, Depends, Request

from app.api.dependencies import get_rag_ingestion, get_rag_retrieval
from app.rag.ingestion import KnowledgeIngestionService
from app.rag.retrieval import RetrievalService
from app.rag.schemas import (
    DocumentMetadata,
    KnowledgeRetrieveRequest,
    RetrievalResponse,
)
from app.schemas.common import ApiResponse

router = APIRouter(prefix="/knowledge", tags=["knowledge"])


@router.get(
    "/documents",
    response_model=ApiResponse[list[DocumentMetadata]],
)
async def list_documents(
    request: Request,
    ingestion: KnowledgeIngestionService = Depends(get_rag_ingestion),
) -> ApiResponse[list[DocumentMetadata]]:
    return ApiResponse(
        data=ingestion.list_documents(),
        request_id=request.state.request_id,
    )


@router.post(
    "/retrieve",
    response_model=ApiResponse[RetrievalResponse],
)
async def retrieve(
    payload: KnowledgeRetrieveRequest,
    request: Request,
    retrieval: RetrievalService = Depends(get_rag_retrieval),
) -> ApiResponse[RetrievalResponse]:
    result = await retrieval.retrieve(payload.query, payload.filters)
    return ApiResponse(data=result, request_id=request.state.request_id)
