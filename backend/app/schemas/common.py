from datetime import datetime
from typing import Generic, TypeVar

from pydantic import BaseModel, ConfigDict, Field


DataT = TypeVar("DataT")


class ApiResponse(BaseModel, Generic[DataT]):
    data: DataT
    request_id: str


class ErrorIssue(BaseModel):
    field: str
    code: str


class ErrorDetail(BaseModel):
    code: str
    message: str
    request_id: str
    issues: list[ErrorIssue] = Field(default_factory=list)


class ErrorResponse(BaseModel):
    error: ErrorDetail


class SourceAttribution(BaseModel):
    model_config = ConfigDict(extra="forbid")

    provider: str
    source_name: str
    source_url: str | None = None
    observed_at: datetime | None = None
