import asyncio
import json

import pytest
from fastapi.testclient import TestClient

from app.core.exceptions import (
    GeminiApiKeyMissingError,
    GeminiOutputError,
    GeminiQuotaError,
    MarketApiKeyMissingError,
    ProviderTimeoutError,
)
from app.integrations.providers import ProviderSet
from app.integrations.gemini import UnconfiguredGeminiProvider
from app.main import create_app
from app.schemas.assistant import AssistantChatRequest
from app.schemas.weather import (
    LocationInput,
    WeatherForecastRequest,
    WeatherForecastResponse,
)
from app.schemas.common import SourceAttribution
from app.services.assistant import AssistantService


FINAL = {
    "answer": "General, non-guaranteed information.",
    "intent": "general",
    "confidence": "medium",
    "needs_clarification": False,
    "follow_up_question": None,
    "key_points": ["Use verified facts."],
    "recommendations": ["Consult a local expert for field-specific decisions."],
    "warnings": [],
}


class SequenceGemini:
    def __init__(self, responses: list[str]) -> None:
        self.responses = list(responses)

    def generate_text(self, system_instruction: str, prompt: str, max_output_tokens: int) -> str:
        del system_instruction, prompt, max_output_tokens
        if not self.responses:
            raise AssertionError("Unexpected Gemini call")
        return self.responses.pop(0)


class DummyWeatherService:
    async def get_forecast(self, request: WeatherForecastRequest) -> WeatherForecastResponse:
        del request
        return WeatherForecastResponse(
            location_label="Salem",
            latitude=11.6643,
            longitude=78.146,
            timezone="Asia/Kolkata",
            source=SourceAttribution(
                provider="Open-Meteo",
                source_name="Open-Meteo Forecast API",
            ),
        )


class DummyMarketService:
    def __init__(self, unavailable: bool = False) -> None:
        self.unavailable = unavailable

    async def search_prices(self, request) -> object:
        del request
        if self.unavailable:
            raise MarketApiKeyMissingError()
        raise AssertionError("Dummy market should not be used")


def make_service(provider) -> AssistantService:
    return AssistantService(
        provider=provider,
        weather_service=DummyWeatherService(),
        market_service=DummyMarketService(unavailable=True),
        timeout_seconds=1,
        max_output_tokens=1200,
        max_history=10,
        max_tool_iterations=2,
    )


@pytest.mark.parametrize("language", ["en", "ta", "te", "hi"])
def test_structured_languages(language: str) -> None:
    provider = SequenceGemini([json.dumps(FINAL)])

    async def scenario() -> None:
        response = await make_service(provider).chat(
            AssistantChatRequest(message="General farming question", language=language)
        )
        assert response.language == language
        assert response.answer

    asyncio.run(scenario())


def test_weather_tool_call_uses_verified_service() -> None:
    tool_call = {
        "tool_call": {
            "name": "get_weather",
            "arguments": {"latitude": 11.6643, "longitude": 78.146, "days": 7},
        }
    }
    final = {**FINAL, "intent": "weather", "data_status": "live"}
    provider = SequenceGemini([json.dumps(tool_call), json.dumps(final)])

    async def scenario() -> None:
        response = await make_service(provider).chat(
            AssistantChatRequest(
                message="What is the weather?",
                language="en",
                location=LocationInput(latitude=11.6643, longitude=78.146),
            )
        )
        assert response.sources
        assert response.sources[0].source_type == "weather"

    asyncio.run(scenario())


def test_mandi_unavailable_does_not_fabricate_prices() -> None:
    tool_call = {
        "tool_call": {
            "name": "get_mandi_prices",
            "arguments": {"state": "Tamil Nadu", "district": "Salem", "commodity": "Tomato"},
        }
    }
    final = {
        **FINAL,
        "intent": "mandi",
        "answer": "Verified mandi prices are unavailable.",
    }
    provider = SequenceGemini([json.dumps(tool_call), json.dumps(final)])

    async def scenario() -> None:
        response = await make_service(provider).chat(
            AssistantChatRequest(message="Tomato mandi price", language="en")
        )
        assert response.sources == []
        assert "mandi" in response.answer.lower()

    asyncio.run(scenario())


def test_unknown_tool_is_rejected() -> None:
    provider = SequenceGemini([
        json.dumps({"tool_call": {"name": "shell", "arguments": {"command": "ls"}}})
    ])

    async def scenario() -> None:
        response = await make_service(provider).chat(
            AssistantChatRequest(message="Run a command", language="en")
        )
        assert response.confidence == "low"
        assert response.warnings

    asyncio.run(scenario())


def test_invalid_tool_arguments_are_rejected() -> None:
    provider = SequenceGemini([
        json.dumps({"tool_call": {"name": "get_weather", "arguments": {"latitude": 91, "longitude": 78}}}),
        json.dumps(FINAL),
    ])

    async def scenario() -> None:
        response = await make_service(provider).chat(
            AssistantChatRequest(message="Weather", language="en")
        )
        assert response.warnings

    asyncio.run(scenario())


def test_invalid_output_retry_then_success() -> None:
    provider = SequenceGemini(["not json", json.dumps(FINAL)])

    async def scenario() -> None:
        response = await make_service(provider).chat(
            AssistantChatRequest(message="General question", language="en")
        )
        assert response.answer

    asyncio.run(scenario())


def test_invalid_output_after_retry_raises_safe_error() -> None:
    provider = SequenceGemini(["not json", "still not json"])

    async def scenario() -> None:
        with pytest.raises(GeminiOutputError):
            await make_service(provider).chat(
                AssistantChatRequest(message="General question", language="en")
            )

    asyncio.run(scenario())


def test_missing_api_key_endpoint() -> None:
    test_app = create_app(
        providers=ProviderSet(gemini=UnconfiguredGeminiProvider()),
    )
    response = TestClient(test_app).post(
        "/api/v1/assistant/chat",
        json={"message": "Hello", "language": "en", "history": []},
    )
    assert response.status_code == 503
    assert response.json()["error"]["code"] == "GEMINI_API_KEY_MISSING"


class QuotaGemini:
    def generate_text(self, system_instruction: str, prompt: str, max_output_tokens: int) -> str:
        del system_instruction, prompt, max_output_tokens
        raise GeminiQuotaError()


def test_quota_error_is_safe() -> None:
    async def scenario() -> None:
        with pytest.raises(GeminiQuotaError):
            await make_service(QuotaGemini()).chat(
                AssistantChatRequest(message="Hello", language="en")
            )

    asyncio.run(scenario())


def test_empty_and_oversized_messages_are_rejected() -> None:
    test_app = create_app(
        providers=ProviderSet(gemini=UnconfiguredGeminiProvider()),
    )
    client = TestClient(test_app)
    empty = client.post(
        "/api/v1/assistant/chat",
        json={"message": "", "language": "en"},
    )
    oversized = client.post(
        "/api/v1/assistant/chat",
        json={"message": "x" * 2001, "language": "en"},
    )
    invalid_language = client.post(
        "/api/v1/assistant/chat",
        json={"message": "Hello", "language": "fr"},
    )
    assert empty.status_code == 422
    assert oversized.status_code == 422
    assert invalid_language.status_code == 422


def test_tanglish_uses_english_language_contract() -> None:
    provider = SequenceGemini([json.dumps(FINAL)])

    async def scenario() -> None:
        response = await make_service(provider).chat(
            AssistantChatRequest(
                message="Inga ippo mazha varuma?",
                language="en",
            )
        )
        assert response.answer

    asyncio.run(scenario())


def test_max_tool_iterations_is_enforced() -> None:
    tool_call = {
        "tool_call": {
            "name": "get_weather",
            "arguments": {"latitude": 11.6643, "longitude": 78.146, "days": 7},
        }
    }
    provider = SequenceGemini([
        json.dumps(tool_call),
        json.dumps(tool_call),
        json.dumps(tool_call),
    ])

    async def scenario() -> None:
        response = await make_service(provider).chat(
            AssistantChatRequest(message="Weather repeatedly", language="en")
        )
        assert response.confidence == "low"
        assert any("tool iteration" in warning for warning in response.warnings)

    asyncio.run(scenario())


class TimeoutGemini:
    def generate_text(self, system_instruction: str, prompt: str, max_output_tokens: int) -> str:
        del system_instruction, prompt, max_output_tokens
        raise TimeoutError


def test_gemini_timeout_is_mapped() -> None:
    async def scenario() -> None:
        with pytest.raises(ProviderTimeoutError):
            await make_service(TimeoutGemini()).chat(
                AssistantChatRequest(message="Hello", language="en")
            )

    asyncio.run(scenario())
