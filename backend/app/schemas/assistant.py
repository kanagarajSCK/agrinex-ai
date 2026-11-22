from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field

from app.schemas.weather import LocationInput


class AssistantQuestionRequest(BaseModel):
    model_config = ConfigDict(extra="forbid", str_strip_whitespace=True)

    question: str = Field(min_length=1, max_length=2_000)
    language: Literal["en", "ta", "te", "hi"] = "en"
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
