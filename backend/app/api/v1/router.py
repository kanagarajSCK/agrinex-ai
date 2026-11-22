from fastapi import APIRouter
from app.api.v1.assistant import router as assistant_router
from app.api.v1.health import router as health_router
from app.api.v1.markets import router as markets_router
from app.api.v1.weather import router as weather_router

api_router = APIRouter()
api_router.include_router(health_router)
api_router.include_router(weather_router)
api_router.include_router(markets_router)
api_router.include_router(assistant_router)
