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
        timeout_seconds: float = 25.0,
    ) -> None:
        self._api_key = api_key.strip()
        self._model = model.strip() or "gemini-3.8-flash"
        self._timeout_seconds = timeout_seconds
        self._client = None

    def _get_client(self):
        if self._client is None:
            from google import genai
            from google.genai import types

            self._client = genai.Client(
                api_key=self._api_key,
                http_options=types.HttpOptions(
                    api_version="v1beta",
                    timeout=int(self._timeout_seconds * 1000),
                ),
            )
        return self._client

    async def answer(
        self,
        request: AssistantQuestionRequest,
    ) -> AssistantAnswerResponse:
        from datetime import datetime
        text = self.generate_text(
            system_instruction="You are AgriNex AI. Provide practical agricultural advice.",
            prompt=request.question,
            max_output_tokens=1000,
        )
        return AssistantAnswerResponse(
            answer=text,
            citations=[],
            generated_at=datetime.now().astimezone(),
            provider="Gemini",
        )

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
            from google.genai.errors import APIError, ClientError, ServerError

            client = self._get_client()
            config = types.GenerateContentConfig(
                system_instruction=system_instruction,
                response_mime_type="application/json",
                max_output_tokens=max_output_tokens,
            )

            candidate_models = [self._model]
            for fallback in (
                "gemini-3.1-flash-lite",
                "gemini-3.5-flash-lite",
                "gemini-flash-lite-latest",
                "gemini-2.5-flash",
                "gemini-3.5-flash",
                "gemini-3.8-flash",
            ):
                if fallback not in candidate_models:
                    candidate_models.append(fallback)

            # Google Gemini API requires deadline >= 10s (10000ms)
            per_candidate_timeout_ms = max(10000, min(int(self._timeout_seconds * 500), 12000))

            last_exc: Exception | None = None
            for model_name in candidate_models:
                try:
                    per_candidate_client = genai.Client(
                        api_key=self._api_key,
                        http_options=types.HttpOptions(
                            api_version="v1beta",
                            timeout=per_candidate_timeout_ms,
                        ),
                    )
                    response = per_candidate_client.models.generate_content(
                        model=model_name,
                        contents=prompt,
                        config=config,
                    )
                    text = None
                    if hasattr(response, "text") and isinstance(response.text, str) and response.text.strip():
                        text = response.text.strip()
                    elif getattr(response, "candidates", None):
                        parts = []
                        for c in response.candidates:
                            if getattr(c, "content", None) and getattr(c.content, "parts", None):
                                for p in c.content.parts:
                                    if getattr(p, "text", None):
                                        parts.append(p.text)
                        if parts:
                            text = "".join(parts).strip()
                    if text:
                        return text
                except Exception as exc:
                    import logging
                    logging.getLogger("agrinex").warning(f"Gemini candidate {model_name} failed: {type(exc).__name__}: {exc}")
                    if isinstance(exc, ClientError):
                        code = getattr(exc, "code", None)
                        message = str(exc).lower()
                        if code in {401, 403} or "api key" in message or "unauthenticated" in message or "permission" in message:
                            raise GeminiAuthenticationError() from exc
                        if code == 429 or "quota" in message or "resource exhausted" in message:
                            last_exc = GeminiQuotaError()
                            continue
                    last_exc = exc
                    continue

            if last_exc is not None:
                raise last_exc
            raise GeminiOutputError()
        except GeminiApiKeyMissingError:
            raise
        except (GeminiAuthenticationError, GeminiQuotaError, GeminiOutputError):
            raise
        except TimeoutError as exc:
            raise ProviderTimeoutError("Gemini") from exc
        except Exception as exc:
            code = getattr(exc, "code", getattr(exc, "status_code", None))
            status_text = str(code or "").lower()
            message = str(exc).lower()
            if status_text in {"429", "resource_exhausted"} or "quota" in message or "resource exhausted" in message:
                raise GeminiQuotaError() from exc
            if status_text in {"401", "403", "unauthenticated", "permission_denied"} or "api key" in message or "credential" in message:
                raise GeminiAuthenticationError() from exc
            if "deadline" in message or "timeout" in status_text or isinstance(exc, TimeoutError):
                raise ProviderTimeoutError("Gemini") from exc
            raise ProviderError("Gemini") from exc
