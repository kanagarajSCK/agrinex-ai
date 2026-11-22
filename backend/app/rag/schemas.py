from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field


class DocumentMetadata(BaseModel):
    model_config = ConfigDict(extra="forbid")

    document_id: str
    title: str
    institution: str
    source_url: str
    publication_year: int | None = Field(default=None, ge=1000, le=2100)
    document_version: str
    language: Literal["en", "ta", "te", "hi"]
    subject: str
    crop: str | None = None
    region: str | None = None
    page_count: int = Field(ge=1)
    content_checksum: str
    ingestion_timestamp: datetime
    verification_status: Literal["verified", "pending_review"]
    usage_permission_status: Literal["approved", "review_required"]
    active: bool = True


class KnowledgeChunk(BaseModel):
    model_config = ConfigDict(extra="forbid")

    chunk_id: str
    document_id: str
    document_version: str
    title: str
    institution: str
    source_url: str
    publication_year: int | None = None
    language: str
    subject: str
    crop: str | None = None
    region: str | None = None
    page_number: int = Field(ge=1)
    page_end: int = Field(ge=1)
    heading: str | None = None
    text: str = Field(min_length=1)
    checksum: str
    active: bool = True


class RetrievalFilters(BaseModel):
    model_config = ConfigDict(extra="forbid")

    institution: str | None = None
    language: str | None = None
    crop: str | None = None
    category: str | None = None
    region: str | None = None
    document_id: str | None = None
    active: bool | None = True


class RetrievalResult(BaseModel):
    chunk: KnowledgeChunk
    score: float


class RetrievalResponse(BaseModel):
    sufficient: bool
    results: list[RetrievalResult] = Field(default_factory=list)
    query: str


class KnowledgeRetrieveRequest(BaseModel):
    model_config = ConfigDict(extra="forbid", str_strip_whitespace=True)

    query: str = Field(min_length=1, max_length=1000)
    filters: RetrievalFilters | None = None
