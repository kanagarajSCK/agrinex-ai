import asyncio
import json
import pytest

from app.core.config import get_settings
from app.integrations.gemini import GoogleGeminiProvider
from app.integrations.markets import DataGovMarketProvider
from app.integrations.weather import OpenMeteoWeatherProvider
from app.locations.repository import LocationRepository
from app.rag.embedding import GoogleEmbeddingProvider
from app.rag.store import ChromaVectorStore
from app.schemas.assistant import AssistantChatRequest
from app.schemas.markets import MarketSearchRequest
from app.schemas.weather import LocationInput, WeatherForecastRequest
from app.services.assistant import AssistantService
from app.services.markets import MarketService
from app.services.weather import WeatherService
from app.core.cache import InMemoryTTLCache


def test_live_weather_open_meteo():
    async def run_test():
        settings = get_settings()
        provider = OpenMeteoWeatherProvider(
            base_url=settings.open_meteo_base_url,
            timeout_seconds=settings.provider_timeout_seconds,
        )
        loc = LocationInput(city="Salem", district="Salem", latitude=11.6643, longitude=78.1460)
        req = WeatherForecastRequest(location=loc, days=7)
        res = await provider.get_forecast(req)
        assert res.current is not None
        assert isinstance(res.current.temperature_c, (int, float))
        assert len(res.forecast) == 7
        assert res.source.provider == "Open-Meteo"
    asyncio.run(run_test())


def test_live_mandi_agmarknet():
    async def run_test():
        settings = get_settings()
        if not settings.data_gov_in_api_key:
            pytest.skip("DATA_GOV_IN_API_KEY is not configured")
        provider = DataGovMarketProvider(
            api_key=settings.data_gov_in_api_key,
            base_url=settings.data_gov_in_base_url,
            resource_id=settings.data_gov_in_resource_id,
            timeout_seconds=settings.provider_timeout_seconds,
        )
        req = MarketSearchRequest(state="Tamil Nadu", limit=5)
        res = await provider.search_prices(req)
        assert res.prices is not None
        assert len(res.prices) > 0
        record = res.prices[0]
        assert record.state == "Tamil Nadu"
        assert record.commodity != ""
        assert record.modal_price_per_quintal is not None
        assert record.arrival_date != ""
    asyncio.run(run_test())


def test_live_gemini_assistant_chat():
    async def run_test():
        settings = get_settings()
        if not settings.gemini_api_key:
            pytest.skip("GEMINI_API_KEY is not configured")
        gemini_provider = GoogleGeminiProvider(
            api_key=settings.gemini_api_key,
            model=settings.gemini_model,
            timeout_seconds=settings.gemini_timeout_seconds,
        )
        weather_service = WeatherService(
            provider=OpenMeteoWeatherProvider(),
            cache=InMemoryTTLCache(),
            timeout_seconds=settings.provider_timeout_seconds,
            cache_ttl_seconds=60,
        )
        market_service = MarketService(
            provider=DataGovMarketProvider(api_key=settings.data_gov_in_api_key),
            cache=InMemoryTTLCache(),
            timeout_seconds=settings.provider_timeout_seconds,
            cache_ttl_seconds=60,
        )
        assistant = AssistantService(
            provider=gemini_provider,
            weather_service=weather_service,
            market_service=market_service,
            timeout_seconds=settings.gemini_timeout_seconds,
            max_output_tokens=settings.gemini_max_output_tokens,
        )
        req = AssistantChatRequest(
            message="What is the best sowing time for groundnut in Salem, Tamil Nadu?",
            language="en",
            history=[],
            location=None,
        )
        res = await assistant.chat(req)
        assert res.answer is not None
        assert len(res.answer.strip()) > 0
        assert res.intent in {"general", "crop", "weather", "mandi", "safety", "clarification"}
    asyncio.run(run_test())


def test_chroma_and_gemini_embeddings():
    settings = get_settings()
    store = ChromaVectorStore(settings.rag_store_path)
    assert store.count() >= 0

    if not settings.gemini_api_key:
        pytest.skip("GEMINI_API_KEY is not configured")
    embedder = GoogleEmbeddingProvider(
        api_key=settings.gemini_api_key,
        model=settings.embedding_model,
        dimensions=settings.embedding_dimensions,
        timeout_seconds=settings.gemini_timeout_seconds,
    )
    vec = embedder.embed("Groundnut seed rate in Tamil Nadu", "RETRIEVAL_DOCUMENT")
    assert len(vec) == 768


def test_location_snapshot_coverage():
    settings = get_settings()
    repo = LocationRepository(settings.lgd_snapshot_path, settings.lgd_backup_path)
    states = repo.states()
    assert len(states) == 36

    tn = next((s for s in states if s.name_en == "Tamil Nadu"), None)
    assert tn is not None
    tn_districts = repo.districts(tn.state_code)
    assert len(tn_districts) >= 30
    salem = next((d for d in tn_districts if d.name_en == "Salem"), None)
    assert salem is not None
    salem_places = repo.places(salem.district_code)
    assert len(salem_places) > 100

    bihar = next((s for s in states if s.name_en == "Bihar"), None)
    assert bihar is not None
    bihar_districts = repo.districts(bihar.state_code)
    assert len(bihar_districts) >= 30
    patna = next((d for d in bihar_districts if d.name_en == "Patna"), None)
    assert patna is not None
    patna_places = repo.places(patna.district_code)
    assert len(patna_places) == 0
