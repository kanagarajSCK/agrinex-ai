from typing import Protocol

from app.core.exceptions import (
    GeminiApiKeyMissingError,
    GeminiAuthenticationError,
    GeminiQuotaError,
    GeminiOutputError,
    ProviderError,
    ProviderTimeoutError,
)
from app.schemas.assistant import (
    AssistantAnswerResponse,
    AssistantQuestionRequest,
)


class GeminiProvider(Protocol):
    async def answer(
        self,
        request: AssistantQuestionRequest,
    ) -> AssistantAnswerResponse: ...

    def generate_text(
        self,
        system_instruction: str,
        prompt: str,
        max_output_tokens: int,
    ) -> str: ...


class UnconfiguredGeminiProvider:
    async def answer(
        self,
        request: AssistantQuestionRequest,
    ) -> AssistantAnswerResponse:
        del request
        raise GeminiApiKeyMissingError()

    def generate_text(
        self,
        system_instruction: str,
        prompt: str,
        max_output_tokens: int,
    ) -> str:
        del system_instruction, prompt, max_output_tokens
        raise GeminiApiKeyMissingError()


class GoogleGeminiProvider:
    def __init__(
        self,
        api_key: str,
        model: str = "gemini-3.8-flash",
        timeout_seconds: float = 20.0,
    ) -> None:
        self._api_key = api_key.strip()
        self._model = model.strip() or "gemini-3.8-flash"
        self._timeout_seconds = timeout_seconds

    async def answer(
        self,
        request: AssistantQuestionRequest,
    ) -> AssistantAnswerResponse:
        del request
        raise GeminiApiKeyMissingError()

    def generate_text(
        self,
        system_instruction: str,
        prompt: str,
        max_output_tokens: int,
    ) -> str:
        if not self._api_key:
            raise GeminiApiKeyMissingError()

        try:
            from google import genai
            from google.genai import types

            client = genai.Client(api_key=self._api_key)
            config = types.GenerateContentConfig(
                systemInstruction=system_instruction,
                responseMimeType="application/json",
                maxOutputTokens=max_output_tokens,
            )
            response = client.models.generate_content(
                model=self._model,
                contents=prompt,
                config=config,
            )
            text = getattr(response, "text", None)
            if not isinstance(text, str) or not text.strip():
                raise GeminiOutputError()
            return text
        except GeminiApiKeyMissingError:
            raise
        except GeminiOutputError:
            raise
        except TimeoutError as exc:
            raise ProviderTimeoutError("Gemini") from exc
        except Exception as exc:
            status = getattr(exc, "status_code", None)
            status_text = str(status or "").lower()
            message = str(exc).lower()
            if status_text in {"429", "resource_exhausted"} or "quota" in message or "resource exhausted" in message:
                raise GeminiQuotaError() from exc
            if status_text in {"401", "403", "unauthenticated", "permission_denied"} or "api key" in message or "credential" in message:
                raise GeminiAuthenticationError() from exc
            raise ProviderError("Gemini") from exc
