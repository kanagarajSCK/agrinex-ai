from fastapi import APIRouter, Request

from app.schemas.common import ApiResponse
from app.schemas.health import HealthResponse

router = APIRouter(tags=["system"])


@router.get(
    "/health",
    response_model=ApiResponse[HealthResponse],
    summary="Service health check",
)
async def health_check(request: Request) -> ApiResponse[HealthResponse]:
    """Return a dependency-free service status."""
    return ApiResponse(
        data=HealthResponse(),
        request_id=request.state.request_id,
    )
