from fastapi import APIRouter, Depends, Request

from app.api.dependencies import get_market_service
from app.schemas.common import ApiResponse, ErrorResponse
from app.schemas.markets import MarketSearchRequest, MarketSearchResponse
from app.services.markets import MarketService

router = APIRouter(prefix="/markets", tags=["markets"])


@router.post(
    "/search",
    response_model=ApiResponse[MarketSearchResponse],
    responses={
        422: {"model": ErrorResponse, "description": "Invalid request"},
        502: {"model": ErrorResponse, "description": "Provider error"},
        503: {"model": ErrorResponse, "description": "Provider not configured"},
        504: {"model": ErrorResponse, "description": "Provider timeout"},
    },
    summary="Search mandi prices",
)
async def search_market_prices(
    payload: MarketSearchRequest,
    request: Request,
    service: MarketService = Depends(get_market_service),
) -> ApiResponse[MarketSearchResponse]:
    prices = await service.search_prices(payload)
    return ApiResponse(data=prices, request_id=request.state.request_id)
