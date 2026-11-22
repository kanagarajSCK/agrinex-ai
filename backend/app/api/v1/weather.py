from fastapi import APIRouter, Depends, Query, Request

from app.api.dependencies import get_weather_service
from app.schemas.common import ApiResponse, ErrorResponse
from app.schemas.weather import (
    LocationInput,
    WeatherForecastRequest,
    WeatherForecastResponse,
)
from app.services.weather import WeatherService

router = APIRouter(prefix="/weather", tags=["weather"])


@router.post(
    "/forecast",
    response_model=ApiResponse[WeatherForecastResponse],
    responses={
        422: {"model": ErrorResponse, "description": "Invalid request"},
        502: {"model": ErrorResponse, "description": "Provider error"},
        503: {"model": ErrorResponse, "description": "Provider not configured"},
        504: {"model": ErrorResponse, "description": "Provider timeout"},
    },
    summary="Get weather forecast",
)
async def get_weather_forecast(
    payload: WeatherForecastRequest,
    request: Request,
    service: WeatherService = Depends(get_weather_service),
) -> ApiResponse[WeatherForecastResponse]:
    forecast = await service.get_forecast(payload)
    return ApiResponse(data=forecast, request_id=request.state.request_id)


async def _get_coordinate_weather(
    latitude: float,
    longitude: float,
    days: int,
    request: Request,
    service: WeatherService,
) -> ApiResponse[WeatherForecastResponse]:
    payload = WeatherForecastRequest(
        location=LocationInput(latitude=latitude, longitude=longitude),
        days=days,
    )
    forecast = await service.get_forecast(payload)
    return ApiResponse(data=forecast, request_id=request.state.request_id)


@router.get(
    "/current",
    response_model=ApiResponse[WeatherForecastResponse],
    summary="Get current weather",
)
async def get_current_weather(
    request: Request,
    latitude: float = Query(..., ge=-90, le=90),
    longitude: float = Query(..., ge=-180, le=180),
    service: WeatherService = Depends(get_weather_service),
):
    return await _get_coordinate_weather(
        latitude,
        longitude,
        1,
        request,
        service,
    )


@router.get(
    "/forecast",
    response_model=ApiResponse[WeatherForecastResponse],
    summary="Get seven-day weather forecast",
)
async def get_coordinate_forecast(
    request: Request,
    latitude: float = Query(..., ge=-90, le=90),
    longitude: float = Query(..., ge=-180, le=180),
    days: int = Query(7, ge=1, le=7),
    service: WeatherService = Depends(get_weather_service),
):
    return await _get_coordinate_weather(
        latitude,
        longitude,
        days,
        request,
        service,
    )


@router.get(
    "/hourly",
    response_model=ApiResponse[WeatherForecastResponse],
    summary="Get hourly weather forecast",
)
async def get_hourly_weather(
    request: Request,
    latitude: float = Query(..., ge=-90, le=90),
    longitude: float = Query(..., ge=-180, le=180),
    service: WeatherService = Depends(get_weather_service),
):
    return await _get_coordinate_weather(
        latitude,
        longitude,
        7,
        request,
        service,
    )
