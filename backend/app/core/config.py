from functools import lru_cache
from typing import Literal
from urllib.parse import urlsplit

from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "AgriNex AI API"
    environment: Literal["development", "test", "staging", "production"] = "development"
    api_v1_prefix: str = "/api/v1"
    allowed_origins: list[str] = Field(default_factory=lambda: ["http://localhost:3000"])
    provider_timeout_seconds: float = Field(default=8.0, gt=0, le=60, allow_inf_nan=False)
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
    gemini_timeout_seconds: float = Field(default=20.0, gt=0, le=60)
    assistant_max_history: int = Field(default=10, ge=0, le=20)
    assistant_max_tool_iterations: int = Field(default=2, ge=1, le=3)
    assistant_request_body_limit_bytes: int = Field(default=32768, ge=1024, le=65536)
    assistant_rate_limit_per_minute: int = Field(default=20, ge=1, le=100)

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
        case_sensitive=False,
    )

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

    @field_validator("allowed_origins")
    @classmethod
    def validate_allowed_origins(cls, origins: list[str]) -> list[str]:
        if not origins:
            raise ValueError("At least one explicit CORS origin is required")

        normalized: list[str] = []
        for origin in origins:
            value = origin.strip().rstrip("/")
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
