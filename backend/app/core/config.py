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
