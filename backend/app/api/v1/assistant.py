from fastapi import APIRouter, Depends, Request

from app.api.dependencies import get_assistant_service
from app.schemas.assistant import AssistantAnswerResponse, AssistantQuestionRequest
from app.schemas.common import ApiResponse, ErrorResponse
from app.services.assistant import AssistantService

router = APIRouter(prefix="/assistant", tags=["assistant"])


@router.post(
    "/questions",
    response_model=ApiResponse[AssistantAnswerResponse],
    responses={
        422: {"model": ErrorResponse, "description": "Invalid request"},
        502: {"model": ErrorResponse, "description": "Provider error"},
        503: {"model": ErrorResponse, "description": "Provider not configured"},
        504: {"model": ErrorResponse, "description": "Provider timeout"},
    },
    summary="Ask an agricultural question",
)
async def ask_question(
    payload: AssistantQuestionRequest,
    request: Request,
    service: AssistantService = Depends(get_assistant_service),
) -> ApiResponse[AssistantAnswerResponse]:
    answer = await service.answer(payload)
    return ApiResponse(data=answer, request_id=request.state.request_id)
