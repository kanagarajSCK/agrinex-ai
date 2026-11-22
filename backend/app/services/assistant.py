from app.integrations.gemini import GeminiProvider
from app.schemas.assistant import AssistantAnswerResponse, AssistantQuestionRequest
from app.services.provider_calls import call_with_timeout


class AssistantService:
    def __init__(self, provider: GeminiProvider, timeout_seconds: float) -> None:
        self._provider = provider
        self._timeout_seconds = timeout_seconds

    async def answer(self, request: AssistantQuestionRequest) -> AssistantAnswerResponse:
        return await call_with_timeout(
            "AI",
            self._provider.answer(request),
            self._timeout_seconds,
        )
