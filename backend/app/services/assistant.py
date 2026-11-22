import asyncio
import json
import re
from datetime import datetime
from typing import Any

from pydantic import BaseModel, ConfigDict, Field, ValidationError

from app.core.exceptions import AppError, GeminiOutputError
from app.integrations.gemini import GeminiProvider
from app.schemas.assistant import (
    AssistantChatRequest,
    AssistantChatResponse,
    AssistantHistoryMessage,
    AssistantAnswerResponse,
    AssistantQuestionRequest,
    AssistantSource,
)
from app.schemas.markets import MarketSearchRequest
from app.schemas.weather import LocationInput, WeatherForecastRequest
from app.services.markets import MarketService
from app.services.provider_calls import call_with_timeout
from app.services.weather import WeatherService
from app.rag.retrieval import RetrievalService


SYSTEM_INSTRUCTION = """You are AgriNex AI, an agricultural information assistant.
Help farmers in clear, practical language in the user's selected language.
You may use Tamil, Telugu, Hindi, English or understandable code-mixed language.
Distinguish verified provider data from general guidance, assumptions and unavailable data.
Never invent weather measurements, mandi prices, soil-test results, crop diagnoses or government eligibility.
Do not claim to have the farmer's location unless it was explicitly supplied.
Never give exact fertilizer or pesticide doses without crop, growth stage, soil information and verified local guidance.
Ask only a concise follow-up when essential information is missing.
Never guarantee yield, income, rainfall or selling price.
Use retrieved knowledge passages only for factual agricultural claims. Do not invent citations, pages or source names.
If retrieval evidence is insufficient, say so clearly. Do not present general knowledge as a verified TNAU/ICAR recommendation.
Do not turn old source recommendations into current advice without qualification.
Return only the requested JSON object. Do not include markdown."""


class WeatherToolArguments(BaseModel):
    model_config = ConfigDict(extra="forbid")

    latitude: float | None = Field(default=None, ge=-90, le=90)
    longitude: float | None = Field(default=None, ge=-180, le=180)
    days: int = Field(default=7, ge=1, le=7)


class MandiToolArguments(BaseModel):
    model_config = ConfigDict(extra="forbid")

    state: str | None = Field(default=None, max_length=100)
    district: str | None = Field(default=None, max_length=100)
    market: str | None = Field(default=None, max_length=100)
    commodity: str | None = Field(default=None, max_length=100)
    variety: str | None = Field(default=None, max_length=100)
    grade: str | None = Field(default=None, max_length=100)
    limit: int = Field(default=20, ge=1, le=100)


class AssistantService:
    def __init__(
        self,
        provider: GeminiProvider,
        weather_service: WeatherService,
        market_service: MarketService,
        timeout_seconds: float,
        max_output_tokens: int,
        max_history: int = 10,
        max_tool_iterations: int = 2,
        retrieval_service: RetrievalService | None = None,
    ) -> None:
        self._provider = provider
        self._weather_service = weather_service
        self._market_service = market_service
        self._timeout_seconds = timeout_seconds
        self._max_output_tokens = max_output_tokens
        self._max_history = max_history
        self._max_tool_iterations = max_tool_iterations
        self._retrieval_service = retrieval_service

    async def answer(self, request: AssistantQuestionRequest) -> AssistantAnswerResponse:
        chat_request = AssistantChatRequest(
            message=request.question,
            language=request.language,
            history=[],
            location=request.location,
        )
        response = await self.chat(chat_request)
        return AssistantAnswerResponse(
            answer=response.answer,
            citations=[],
            generated_at=datetime.now().astimezone(),
            provider="Gemini",
        )

    async def chat(self, request: AssistantChatRequest) -> AssistantChatResponse:
        history = request.history[-self._max_history :]
        prompt = self._build_prompt(request, history)
        verified_sources: list[AssistantSource] = []
        data_status: str = "general"
        warnings: list[str] = []
        tool_iterations = 0

        if self._retrieval_service:
            retrieval = await self._retrieval_service.retrieve(request.message)
            if retrieval.sufficient:
                rag_lines: list[str] = []
                for result in retrieval.results:
                    chunk = result.chunk
                    rag_lines.append(
                        "Source metadata: "
                        f"title={chunk.title}; institution={chunk.institution}; "
                        f"publication_year={chunk.publication_year}; "
                        f"document_version={chunk.document_version}; "
                        f"page={chunk.page_number}-{chunk.page_end}; "
                        f"url={chunk.source_url}; document_id={chunk.document_id}\n"
                        f"Passage: {chunk.text}"
                    )
                    verified_sources.append(
                        AssistantSource(
                            name=chunk.title,
                            source_type="knowledge",
                            institution=chunk.institution,
                            publication_year=chunk.publication_year,
                            document_version=chunk.document_version,
                            page_number=chunk.page_number,
                            page_end=chunk.page_end,
                            source_url=chunk.source_url,
                            document_id=chunk.document_id,
                            fields_used=["retrieved passage"],
                        )
                    )
                prompt += (
                    "\nVerified knowledge-base evidence follows. Use only these passages "
                    "for agricultural facts. Do not invent citations, pages or institutions. "
                    "Every knowledge-grounded factual claim must use one of these trusted sources:\n"
                    + "\n\n".join(rag_lines)
                )
                data_status = "mixed"
            else:
                warnings.append(
                    "The knowledge base had insufficient relevant evidence for this question."
                )

        while tool_iterations <= self._max_tool_iterations:
            text = await call_with_timeout(
                "Gemini",
                asyncio.to_thread(
                    self._provider.generate_text,
                    SYSTEM_INSTRUCTION,
                    prompt,
                    self._max_output_tokens,
                ),
                self._timeout_seconds,
            )

            payload = _extract_json(text)
            if payload is None:
                payload = await self._retry_invalid_output(prompt)

            tool_call = payload.get("tool_call")
            if not isinstance(tool_call, dict):
                return self._finalize_payload(
                    payload,
                    request.language,
                    verified_sources,
                    data_status,
                    warnings,
                )

            tool_iterations += 1
            if tool_iterations > self._max_tool_iterations:
                return self._safe_response(
                    request.language,
                    "I could not complete the verified data lookup within the allowed tool limit.",
                    "clarification",
                    "unavailable",
                    warnings=["The maximum verified-data tool iteration limit was reached."],
                )

            tool_name = tool_call.get("name")
            arguments = tool_call.get("arguments")
            if not isinstance(arguments, dict):
                warnings.append("The AI requested an invalid tool argument object.")
                prompt += "\nTool error: INVALID_ARGUMENTS. Do not invent data. Return the final JSON response."
                continue

            if tool_name == "get_weather":
                result = await self._run_weather(arguments, request.location)
                if isinstance(result, tuple):
                    tool_data, source = result
                    verified_sources.append(source)
                    data_status = "live"
                else:
                    tool_data = {"available": False, "error": result}
                    data_status = "unavailable"
                    warnings.append(result)
                prompt += f"\nVerified get_weather result: {json.dumps(tool_data, ensure_ascii=False)}"
            elif tool_name == "get_mandi_prices":
                result = await self._run_mandi(arguments)
                if isinstance(result, tuple):
                    tool_data, sources = result
                    verified_sources.extend(sources)
                    data_status = "live" if tool_data.get("record_count", 0) else "unavailable"
                    if tool_data.get("record_count", 0) == 0:
                        warnings.append("No verified mandi records were returned.")
                else:
                    tool_data = {"available": False, "error": result}
                    data_status = "unavailable"
                    warnings.append(result)
                prompt += f"\nVerified get_mandi_prices result: {json.dumps(tool_data, ensure_ascii=False)}"
            else:
                warnings.append("The AI requested an unknown tool.")
                return self._safe_response(
                    request.language,
                    "I can only use verified weather and mandi tools. I cannot complete that request.",
                    "clarification",
                    "unavailable",
                    warnings,
                )

            prompt += "\nUse only this verified tool result. Do not invent missing fields. Return the final structured JSON object."

        return self._safe_response(
            request.language,
            "I could not complete the verified data lookup.",
            "clarification",
            "unavailable",
            warnings,
        )

    async def _retry_invalid_output(self, prompt: str) -> dict[str, Any]:
        retry_prompt = prompt + "\nYour previous output was not valid JSON. Return only valid JSON matching the required schema."
        text = await call_with_timeout(
            "Gemini",
            asyncio.to_thread(
                self._provider.generate_text,
                SYSTEM_INSTRUCTION,
                retry_prompt,
                self._max_output_tokens,
            ),
            self._timeout_seconds,
        )
        payload = _extract_json(text)
        if payload is None:
            raise GeminiOutputError()
        return payload

    async def _run_weather(
        self,
        arguments: dict[str, Any],
        context_location: LocationInput | None,
    ) -> tuple[dict[str, Any], AssistantSource] | str:
        try:
            parsed = WeatherToolArguments.model_validate(arguments)
            latitude = parsed.latitude
            longitude = parsed.longitude
            if (latitude is None or longitude is None) and context_location:
                latitude = context_location.latitude
                longitude = context_location.longitude
            if latitude is None or longitude is None:
                return "A latitude and longitude are required for verified weather lookup."
            weather = await self._weather_service.get_forecast(
                WeatherForecastRequest(
                    location=LocationInput(latitude=latitude, longitude=longitude),
                    days=parsed.days,
                )
            )
        except ValidationError:
            return "The weather tool arguments are invalid."
        except AppError as exc:
            return exc.public_message

        source = AssistantSource(
            name="Open-Meteo",
            source_type="weather",
            retrieved_at=weather.source.observed_at,
            fields_used=["temperature", "humidity", "precipitation", "wind", "forecast"],
        )
        return (
            {
                "available": True,
                "latitude": weather.latitude,
                "longitude": weather.longitude,
                "timezone": weather.timezone,
                "current": (
                    weather.current.model_dump(mode="json") if weather.current else None
                ),
                "forecast": [
                    item.model_dump(mode="json") for item in weather.forecast
                ],
                "hourly": [
                    item.model_dump(mode="json") for item in weather.hourly
                ],
                "units": weather.units.model_dump(mode="json"),
                "source": weather.source.model_dump(mode="json"),
            },
            source,
        )

    async def _run_mandi(
        self,
        arguments: dict[str, Any],
    ) -> tuple[dict[str, Any], list[AssistantSource]] | str:
        try:
            parsed = MandiToolArguments.model_validate(arguments)
            market = await self._market_service.search_prices(
                MarketSearchRequest(
                    state=parsed.state,
                    district=parsed.district,
                    market=parsed.market,
                    commodity=parsed.commodity,
                    variety=parsed.variety,
                    grade=parsed.grade,
                    limit=parsed.limit,
                )
            )
        except ValidationError:
            return "The mandi tool arguments are invalid."
        except AppError as exc:
            return exc.public_message

        records = [record.model_dump(mode="json") for record in market.prices]
        sources = [
            AssistantSource(
                name="AGMARKNET / data.gov.in",
                source_type="market",
                retrieved_at=market.retrieved_at,
                arrival_date=record.arrival_date,
                fields_used=[
                    "commodity",
                    "variety",
                    "grade",
                    "market",
                    "min_price",
                    "max_price",
                    "modal_price",
                    "price_unit",
                ],
            )
            for record in market.prices[:10]
        ]
        return (
            {
                "available": True,
                "record_count": market.record_count,
                "latest_arrival_date": (
                    market.latest_arrival_date.isoformat()
                    if market.latest_arrival_date
                    else None
                ),
                "retrieved_at": market.retrieved_at.isoformat(),
                "stale": market.stale,
                "records": records,
            },
            sources,
        )

    def _finalize_payload(
        self,
        payload: dict[str, Any],
        language: str,
        sources: list[AssistantSource],
        data_status: str,
        warnings: list[str],
    ) -> AssistantChatResponse:
        if "answer" not in payload:
            return self._safe_response(
                language,
                "I could not produce a valid structured response.",
                "clarification",
                "unavailable",
                warnings or ["Structured provider output was missing an answer."],
            )
        payload["language"] = language
        payload["sources"] = [source.model_dump(mode="json") for source in sources]
        payload["data_status"] = data_status
        payload["warnings"] = list(dict.fromkeys(warnings + payload.get("warnings", [])))
        try:
            return AssistantChatResponse.model_validate(payload)
        except ValidationError:
            raise GeminiOutputError()

    def _safe_response(
        self,
        language: str,
        answer: str,
        intent: str,
        data_status: str,
        warnings: list[str],
    ) -> AssistantChatResponse:
        return AssistantChatResponse(
            answer=answer,
            language=language if language in {"en", "ta", "te", "hi"} else "en",
            intent=intent,  # type: ignore[arg-type]
            confidence="low",
            needs_clarification=True,
            follow_up_question=None,
            key_points=[],
            recommendations=[],
            sources=[],
            data_status=data_status,  # type: ignore[arg-type]
            warnings=warnings,
        )

    def _build_prompt(
        self,
        request: AssistantChatRequest,
        history: list[AssistantHistoryMessage],
    ) -> str:
        history_json = [
            {"role": item.role, "content": item.content}
            for item in history
        ]
        location_json = (
            request.location.model_dump(mode="json", exclude_none=True)
            if request.location
            else None
        )
        return (
            "Return a JSON object with: answer, intent, confidence, "
            "needs_clarification, follow_up_question, key_points, recommendations, "
            "warnings. intent must be one of general/weather/mandi/crop/safety/clarification. "
            "confidence must be low/medium/high. If verified provider data is needed, "
            "first return exactly: "
            '{"tool_call":{"name":"get_weather","arguments":{"latitude":11.6643,"longitude":78.146,"days":7}}} '
            'or {"tool_call":{"name":"get_mandi_prices","arguments":{"state":"Tamil Nadu","district":"Salem","commodity":"Tomato","limit":20}}}. '
            "Use only get_weather and get_mandi_prices. Do not invent data. "
            f"Selected language code: {request.language}. "
            f"Conversation history: {json.dumps(history_json, ensure_ascii=False)}. "
            f"Explicit location context: {json.dumps(location_json, ensure_ascii=False)}. "
            f"Farmer message: {json.dumps(request.message, ensure_ascii=False)}"
        )


def _extract_json(text: str) -> dict[str, Any] | None:
    cleaned = text.strip()
    cleaned = re.sub(r"^```(?:json)?\s*", "", cleaned, flags=re.IGNORECASE)
    cleaned = re.sub(r"\s*```$", "", cleaned)
    try:
        parsed = json.loads(cleaned)
    except json.JSONDecodeError:
        match = re.search(r"\{.*\}", cleaned, flags=re.DOTALL)
        if not match:
            return None
        try:
            parsed = json.loads(match.group(0))
        except json.JSONDecodeError:
            return None
    return parsed if isinstance(parsed, dict) else None
