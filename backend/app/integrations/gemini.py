from typing import Protocol

from app.core.exceptions import IntegrationNotConfiguredError
from app.schemas.assistant import AssistantAnswerResponse, AssistantQuestionRequest


class GeminiProvider(Protocol):
    async def answer(
        self,
        request: AssistantQuestionRequest,
    ) -> AssistantAnswerResponse: ...


class UnconfiguredGeminiProvider:
    async def answer(
        self,
        request: AssistantQuestionRequest,
    ) -> AssistantAnswerResponse:
        del request
        raise IntegrationNotConfiguredError("AI")
