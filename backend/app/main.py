from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1.router import api_router
from app.core.config import get_settings
from app.core.errors import register_exception_handlers

settings = get_settings()
app = FastAPI(title=settings.app_name, version="0.1.0", docs_url="/docs" if settings.environment != "production" else None)
app.add_middleware(CORSMiddleware, allow_origins=settings.allowed_origins, allow_credentials=True, allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE"], allow_headers=["Authorization", "Content-Type"])
register_exception_handlers(app)
app.include_router(api_router, prefix=settings.api_v1_prefix)
