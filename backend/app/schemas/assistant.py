from datetime import date, datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field

from app.schemas.weather import LocationInput


AssistantLanguage = Literal["en", "ta", "te", "hi"]


class AssistantHistoryMessage(BaseModel):
    model_config = ConfigDict(extra="forbid", str_strip_whitespace=True)

    role: Literal["user", "assistant"]
    content: str = Field(min_length=1, max_length=2_000)


class AssistantChatRequest(BaseModel):
    model_config = ConfigDict(extra="forbid", str_strip_whitespace=True)

    message: str = Field(min_length=1, max_length=2_000)
    language: AssistantLanguage = "en"
    history: list[AssistantHistoryMessage] = Field(default_factory=list, max_length=10)
    location: LocationInput | None = None


class AssistantSource(BaseModel):
    model_config = ConfigDict(extra="forbid")

    name: str = Field(min_length=1, max_length=200)
    source_type: Literal["weather", "market", "general", "knowledge"]
    retrieved_at: datetime | None = None
    arrival_date: date | None = None
    fields_used: list[str] = Field(default_factory=list, max_length=30)
    title: str | None = Field(default=None, max_length=300)
    institution: str | None = Field(default=None, max_length=200)
    publication_year: int | None = Field(default=None, ge=1000, le=2100)
    document_version: str | None = Field(default=None, max_length=100)
    page_number: int | None = Field(default=None, ge=1)
    page_end: int | None = Field(default=None, ge=1)
    source_url: str | None = Field(default=None, max_length=1000)
    document_id: str | None = Field(default=None, max_length=200)


class AssistantChatResponse(BaseModel):
    model_config = ConfigDict(extra="forbid")

    answer: str = Field(min_length=1, max_length=8_000)
    language: AssistantLanguage
    intent: Literal["general", "weather", "mandi", "crop", "safety", "clarification"]
    confidence: Literal["low", "medium", "high"]
    needs_clarification: bool = False
    follow_up_question: str | None = Field(default=None, max_length=500)
    key_points: list[str] = Field(default_factory=list, max_length=12)
    recommendations: list[str] = Field(default_factory=list, max_length=12)
    sources: list[AssistantSource] = Field(default_factory=list, max_length=10)
    data_status: Literal["live", "general", "unavailable", "mixed"]
    warnings: list[str] = Field(default_factory=list, max_length=12)


# Backward-compatible Phase 03 contract.
class AssistantQuestionRequest(BaseModel):
    model_config = ConfigDict(extra="forbid", str_strip_whitespace=True)

    question: str = Field(min_length=1, max_length=2_000)
    language: AssistantLanguage = "en"
    location: LocationInput | None = None


class SourceCitation(BaseModel):
    title: str
    publisher: str
    source_url: str
    retrieved_at: datetime


class AssistantAnswerResponse(BaseModel):
    answer: str = Field(min_length=1)
    citations: list[SourceCitation] = Field(default_factory=list)
    generated_at: datetime
    provider: str
