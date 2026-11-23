import json
from functools import lru_cache
from pathlib import Path
from typing import Any, Literal
from urllib.parse import urlsplit

from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

BACKEND_DIR = Path(__file__).resolve().parent.parent.parent


class Settings(BaseSettings):
    app_name: str = "AgriNex AI API"
    environment: Literal["development", "test", "staging", "production"] = "development"
    api_v1_prefix: str = "/api/v1"
    allowed_origins: list[str] = Field(
        default_factory=lambda: [
            "http://localhost:3000",
            "http://127.0.0.1:3000",
            "http://localhost:3001",
            "http://127.0.0.1:3001",
            "https://agrinex-ai-xi.vercel.app",
            "https://agrinex-ai.vercel.app",
        ]
    )
    provider_timeout_seconds: float = Field(default=12.0, gt=0, le=60, allow_inf_nan=False)
    cache_ttl_seconds: float = Field(default=60, ge=0, le=86_400, allow_inf_nan=False)
    cache_max_entries: int = Field(default=512, ge=1, le=100_000)
    log_level: Literal["DEBUG", "INFO", "WARNING", "ERROR"] = "INFO"
    open_meteo_base_url: str = "https://api.open-meteo.com"
    data_gov_in_api_key: str = ""
    data_gov_in_resource_id: str = "9ef84268-d588-465a-a308-a864a43d0070"
    data_gov_in_base_url: str = "https://api.data.gov.in"
    market_cache_ttl_seconds: float = Field(default=900, ge=0, le=86_400, allow_inf_nan=False)
    gemini_api_key: str = ""
    gemini_model: str = "gemini-3.8-flash"
    gemini_max_output_tokens: int = Field(default=1200, ge=256, le=4096)
    gemini_timeout_seconds: float = Field(default=30.0, gt=0, le=60)
    assistant_max_history: int = Field(default=10, ge=0, le=20)
    assistant_max_tool_iterations: int = Field(default=2, ge=1, le=3)
    assistant_request_body_limit_bytes: int = Field(default=32768, ge=1024, le=65536)
    assistant_rate_limit_per_minute: int = Field(default=20, ge=1, le=100)
    embedding_model: str = "gemini-embedding-001"
    embedding_dimensions: int = Field(default=768, ge=128, le=3072)
    rag_store_path: str = "../knowledge-base/chroma"
    rag_documents_path: str = "../knowledge-base/documents.json"
    rag_top_k: int = Field(default=5, ge=1, le=20)
    rag_relevance_threshold: float = Field(default=0.72, ge=0.0, le=1.0)
    rag_chunk_size: int = Field(default=1200, ge=300, le=4000)
    rag_chunk_overlap: int = Field(default=150, ge=0, le=500)
    rag_max_context_chars: int = Field(default=6000, ge=1000, le=30000)
    lgd_snapshot_path: str = "../knowledge-base/locations_snapshot.json"
    lgd_backup_path: str = "../knowledge-base/locations_snapshot.previous.json"
    geocoding_base_url: str = "https://geocoding-api.open-meteo.com"

    model_config = SettingsConfigDict(
        env_file=str(BACKEND_DIR / ".env"),
        env_file_encoding="utf-8",
        extra="ignore",
        case_sensitive=False,
    )

    @field_validator("rag_store_path", "rag_documents_path", "lgd_snapshot_path", "lgd_backup_path")
    @classmethod
    def resolve_relative_paths(cls, value: str) -> str:
        path = Path(value)
        if path.is_absolute():
            return str(path)

        # Check candidate locations (Render rootDir: backend vs repo root vs relative)
        candidates = [
            (BACKEND_DIR / path).resolve(),
            (BACKEND_DIR.parent / path).resolve(),
            (BACKEND_DIR.parent / "knowledge-base" / path.name).resolve(),
            (BACKEND_DIR / "knowledge-base" / path.name).resolve(),
            path.resolve(),
        ]
        for candidate in candidates:
            if candidate.exists():
                return str(candidate)

        return str((BACKEND_DIR / path).resolve())

    @field_validator("data_gov_in_api_key", mode="before")
    @classmethod
    def clean_data_gov_api_key(cls, value: Any) -> str:
        if isinstance(value, str):
            cleaned = value.strip().strip("\"'").strip()
            if cleaned == "your-datagov-api-key-here":
                return ""
            return cleaned
        return ""

    @field_validator("gemini_api_key", mode="before")
    @classmethod
    def clean_gemini_api_key(cls, value: Any) -> str:
        if isinstance(value, str):
            cleaned = value.strip().strip("\"'").strip()
            if cleaned == "your-gemini-api-key-here":
                return ""
            return cleaned
        return ""

    @field_validator("api_v1_prefix")
    @classmethod
    def validate_api_prefix(cls, value: str) -> str:
        if not value.startswith("/") or value == "/" or value.endswith("/"):
            raise ValueError("API prefix must be an absolute path without a trailing slash")
        return value

    @field_validator("open_meteo_base_url")
    @classmethod
    def validate_open_meteo_url(cls, value: str) -> str:
        parsed = urlsplit(value.strip().rstrip("/"))
        if parsed.scheme != "https" or parsed.netloc != "api.open-meteo.com":
            raise ValueError("OPEN_METEO_BASE_URL must use the official api.open-meteo.com host")
        if parsed.path:
            raise ValueError("OPEN_METEO_BASE_URL must not contain a path")
        return value.strip().rstrip("/")

    @field_validator("data_gov_in_base_url")
    @classmethod
    def validate_data_gov_url(cls, value: str) -> str:
        parsed = urlsplit(value.strip().rstrip("/"))
        if parsed.scheme != "https" or parsed.netloc != "api.data.gov.in":
            raise ValueError("DATA_GOV_IN_BASE_URL must use the official api.data.gov.in host")
        if parsed.path:
            raise ValueError("DATA_GOV_IN_BASE_URL must not contain a path")
        return value.strip().rstrip("/")

    @field_validator("data_gov_in_resource_id")
    @classmethod
    def validate_market_resource_id(cls, value: str) -> str:
        if value != "9ef84268-d588-465a-a308-a864a43d0070":
            raise ValueError("DATA_GOV_IN_RESOURCE_ID must match the verified AGMARKNET resource")
        return value

    @field_validator("geocoding_base_url")
    @classmethod
    def validate_geocoding_url(cls, value: str) -> str:
        parsed = urlsplit(value.strip().rstrip("/"))
        if parsed.scheme != "https" or parsed.netloc != "geocoding-api.open-meteo.com":
            raise ValueError("GEOCODING_BASE_URL must use the official Open-Meteo geocoding host")
        if parsed.path:
            raise ValueError("GEOCODING_BASE_URL must not contain a path")
        return value.strip().rstrip("/")

    @field_validator("allowed_origins", mode="before")
    @classmethod
    def validate_allowed_origins(cls, origins: Any) -> list[str]:
        if isinstance(origins, str):
            text = origins.strip()
            if text.startswith("[") and text.endswith("]"):
                try:
                    origins = json.loads(text)
                except Exception:
                    origins = [x.strip() for x in text.strip("[]").split(",") if x.strip()]
            else:
                origins = [x.strip() for x in text.split(",") if x.strip()]

        if not isinstance(origins, list) or not origins:
            raise ValueError("At least one explicit CORS origin is required")

        normalized: list[str] = []
        for origin in origins:
            value = str(origin).strip().rstrip("/")
            parsed = urlsplit(value)
            if (
                value == "*"
                or parsed.scheme not in {"http", "https"}
                or not parsed.netloc
                or parsed.path
                or parsed.query
                or parsed.fragment
                or parsed.username
                or parsed.password
            ):
                raise ValueError("CORS origins must be explicit HTTP(S) origins without paths")
            normalized.append(value)
        return normalized


@lru_cache
def get_settings() -> Settings:
    return Settings()
