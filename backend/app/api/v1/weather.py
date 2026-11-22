from fastapi import APIRouter, Depends, Request

from app.api.dependencies import get_weather_service
from app.schemas.common import ApiResponse, ErrorResponse
from app.schemas.weather import WeatherForecastRequest, WeatherForecastResponse
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
