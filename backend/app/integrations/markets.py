from typing import Protocol

from app.core.exceptions import IntegrationNotConfiguredError
from app.schemas.markets import MarketSearchRequest, MarketSearchResponse


class MarketProvider(Protocol):
    async def search_prices(
        self,
        request: MarketSearchRequest,
    ) -> MarketSearchResponse: ...


class UnconfiguredMarketProvider:
    async def search_prices(
        self,
        request: MarketSearchRequest,
    ) -> MarketSearchResponse:
        del request
        raise IntegrationNotConfiguredError("market")
