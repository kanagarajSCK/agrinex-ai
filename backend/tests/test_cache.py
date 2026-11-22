import asyncio
import math

import pytest

from app.core.cache import InMemoryTTLCache


def test_cache_expires_entries_at_the_expiration_boundary() -> None:
    async def scenario() -> None:
        now = [10.0]
        cache = InMemoryTTLCache[str](clock=lambda: now[0])
        await cache.set("key", "value", ttl_seconds=3)

        now[0] = 12.999
        assert await cache.get("key") == "value"
        now[0] = 13.0
        assert await cache.get("key") is None

    asyncio.run(scenario())


def test_cache_evicts_least_recently_used_entry() -> None:
    async def scenario() -> None:
        cache = InMemoryTTLCache[str](max_entries=2)
        await cache.set("first", "1", ttl_seconds=30)
        await cache.set("second", "2", ttl_seconds=30)
        assert await cache.get("first") == "1"
        await cache.set("third", "3", ttl_seconds=30)

        assert await cache.get("first") == "1"
        assert await cache.get("second") is None
        assert await cache.get("third") == "3"

    asyncio.run(scenario())


@pytest.mark.parametrize("ttl", [0, -1, math.inf, math.nan])
def test_cache_rejects_nonpositive_or_nonfinite_ttl(ttl: float) -> None:
    async def scenario() -> None:
        cache = InMemoryTTLCache[str]()
        with pytest.raises(ValueError):
            await cache.set("key", "value", ttl_seconds=ttl)

    asyncio.run(scenario())
