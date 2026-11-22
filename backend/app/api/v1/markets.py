from datetime import date

from fastapi import APIRouter, Depends, Query, Request

from app.api.dependencies import get_market_service
from app.schemas.common import ApiResponse, ErrorResponse
from app.schemas.markets import (
    CommodityListResponse,
    GeographyListResponse,
    MarketSearchRequest,
    MarketSearchResponse,
    MarketSummary,
    MarketSummaryResponse,
    MarketTrendResponse,
)
from app.services.markets import MarketService

router = APIRouter(prefix="/markets", tags=["markets"])


def _search_request(
    state: str | None,
    district: str | None,
    market: str | None,
    commodity: str | None,
    variety: str | None,
    grade: str | None,
    arrival_date: date | None,
    limit: int,
    offset: int,
) -> MarketSearchRequest:
    return MarketSearchRequest(
        state=state,
        district=district,
        market=market,
        commodity=commodity,
        variety=variety,
        grade=grade,
        arrival_date=arrival_date,
        limit=limit,
        offset=offset,
    )


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


@router.get(
    "/prices",
    response_model=ApiResponse[MarketSearchResponse],
    summary="Search genuine AGMARKNET mandi prices",
)
async def get_market_prices(
    request: Request,
    state: str | None = Query(None, max_length=100),
    district: str | None = Query(None, max_length=100),
    market: str | None = Query(None, max_length=100),
    commodity: str | None = Query(None, max_length=100),
    variety: str | None = Query(None, max_length=100),
    grade: str | None = Query(None, max_length=100),
    arrival_date: date | None = None,
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    service: MarketService = Depends(get_market_service),
) -> ApiResponse[MarketSearchResponse]:
    payload = _search_request(
        state,
        district,
        market,
        commodity,
        variety,
        grade,
        arrival_date,
        limit,
        offset,
    )
    prices = await service.search_prices(payload)
    return ApiResponse(data=prices, request_id=request.state.request_id)


@router.get(
    "/commodities",
    response_model=ApiResponse[CommodityListResponse],
    summary="List commodities returned by AGMARKNET",
)
async def get_commodities(
    request: Request,
    state: str | None = Query("Tamil Nadu", max_length=100),
    district: str | None = Query(None, max_length=100),
    limit: int = Query(100, ge=1, le=100),
    service: MarketService = Depends(get_market_service),
) -> ApiResponse[CommodityListResponse]:
    payload = _search_request(
        state,
        district,
        None,
        None,
        None,
        None,
        None,
        limit,
        0,
    )
    prices = await service.search_prices(payload)
    commodities = sorted({record.commodity for record in prices.prices if record.commodity})
    data = CommodityListResponse(
        commodities=commodities,
        retrieved_at=prices.retrieved_at,
        source=prices.source,
    )
    return ApiResponse(data=data, request_id=request.state.request_id)


@router.get(
    "/geographies",
    response_model=ApiResponse[GeographyListResponse],
    summary="List markets and districts returned by AGMARKNET",
)
async def get_geographies(
    request: Request,
    state: str | None = Query("Tamil Nadu", max_length=100),
    district: str | None = Query(None, max_length=100),
    limit: int = Query(100, ge=1, le=100),
    service: MarketService = Depends(get_market_service),
) -> ApiResponse[GeographyListResponse]:
    payload = _search_request(
        state,
        district,
        None,
        None,
        None,
        None,
        None,
        limit,
        0,
    )
    prices = await service.search_prices(payload)
    data = GeographyListResponse(
        states=sorted({record.state for record in prices.prices if record.state}),
        districts=sorted({record.district for record in prices.prices if record.district}),
        markets=sorted({record.market for record in prices.prices if record.market}),
        retrieved_at=prices.retrieved_at,
        source=prices.source,
    )
    return ApiResponse(data=data, request_id=request.state.request_id)


@router.get(
    "/summary",
    response_model=ApiResponse[MarketSummaryResponse],
    summary="Summarize genuine compatible market records",
)
async def get_market_summary(
    request: Request,
    state: str | None = Query(None, max_length=100),
    district: str | None = Query(None, max_length=100),
    market: str | None = Query(None, max_length=100),
    commodity: str = Query(..., min_length=1, max_length=100),
    variety: str | None = Query(None, max_length=100),
    grade: str | None = Query(None, max_length=100),
    arrival_date: date | None = None,
    limit: int = Query(100, ge=1, le=100),
    service: MarketService = Depends(get_market_service),
) -> ApiResponse[MarketSummaryResponse]:
    payload = _search_request(
        state,
        district,
        market,
        commodity,
        variety,
        grade,
        arrival_date,
        limit,
        0,
    )
    prices = await service.search_prices(payload)
    compatible = [
        record
        for record in prices.prices
        if record.commodity == commodity
        and (variety is None or record.variety == variety)
        and (grade is None or record.grade == grade)
        and record.price_unit == "INR/quintal"
    ]

    highest_record = max(compatible, key=lambda record: record.modal_price_per_quintal, default=None)
    lowest_record = min(compatible, key=lambda record: record.modal_price_per_quintal, default=None)
    prices_found = [record.modal_price_per_quintal for record in compatible]
    summary = MarketSummary(
        commodity=commodity,
        variety=variety,
        grade=grade,
        compatible_record_count=len(compatible),
        highest_modal_price_per_quintal=(
            highest_record.modal_price_per_quintal if highest_record else None
        ),
        highest_modal_market=highest_record.market if highest_record else None,
        lowest_modal_price_per_quintal=(
            lowest_record.modal_price_per_quintal if lowest_record else None
        ),
        lowest_modal_market=lowest_record.market if lowest_record else None,
        reported_price_range_per_quintal=(
            (min(prices_found), max(prices_found)) if prices_found else None
        ),
        latest_arrival_date=(
            max(record.arrival_date for record in compatible) if compatible else None
        ),
        stale=prices.stale,
    )
    data = MarketSummaryResponse(
        summary=summary,
        retrieved_at=prices.retrieved_at,
        source=prices.source,
    )
    return ApiResponse(data=data, request_id=request.state.request_id)


@router.get(
    "/trends",
    response_model=ApiResponse[MarketTrendResponse],
    summary="Report genuine historical trend availability",
)
async def get_market_trends(
    request: Request,
    state: str | None = Query(None, max_length=100),
    district: str | None = Query(None, max_length=100),
    market: str | None = Query(None, max_length=100),
    commodity: str = Query(..., min_length=1, max_length=100),
    variety: str | None = Query(None, max_length=100),
    grade: str | None = Query(None, max_length=100),
    service: MarketService = Depends(get_market_service),
) -> ApiResponse[MarketTrendResponse]:
    payload = _search_request(
        state,
        district,
        market,
        commodity,
        variety,
        grade,
        None,
        100,
        0,
    )
    prices = await service.search_prices(payload)
    data = MarketTrendResponse(
        available=False,
        records=[],
        retrieved_at=prices.retrieved_at,
        source=prices.source,
    )
    return ApiResponse(data=data, request_id=request.state.request_id)
