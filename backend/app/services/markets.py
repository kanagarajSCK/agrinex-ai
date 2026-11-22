from app.core.cache import AsyncCache
from app.integrations.markets import MarketProvider
from app.schemas.markets import MarketSearchRequest, MarketSearchResponse
from app.services.provider_calls import call_with_timeout, request_cache_key


class MarketService:
    def __init__(
        self,
        provider: MarketProvider,
        cache: AsyncCache[MarketSearchResponse],
        timeout_seconds: float,
        cache_ttl_seconds: float,
    ) -> None:
        self._provider = provider
        self._cache = cache
        self._timeout_seconds = timeout_seconds
        self._cache_ttl_seconds = cache_ttl_seconds

    async def search_prices(self, request: MarketSearchRequest) -> MarketSearchResponse:
        cache_key = request_cache_key("markets", request)
        if self._cache_ttl_seconds > 0:
            cached = await self._cache.get(cache_key)
            if cached is not None:
                return cached

        results = await call_with_timeout(
            "market",
            self._provider.search_prices(request),
            self._timeout_seconds,
        )
        if self._cache_ttl_seconds > 0:
            await self._cache.set(cache_key, results, self._cache_ttl_seconds)
        return results
