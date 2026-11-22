import math
import time
from collections import OrderedDict
from dataclasses import dataclass
from typing import Callable, Generic, Protocol, TypeVar


ValueT = TypeVar("ValueT")


class AsyncCache(Protocol[ValueT]):
    async def get(self, key: str) -> ValueT | None: ...

    async def set(self, key: str, value: ValueT, ttl_seconds: float) -> None: ...


@dataclass(frozen=True)
class CacheEntry(Generic[ValueT]):
    value: ValueT
    expires_at: float


class InMemoryTTLCache(Generic[ValueT]):
    def __init__(
        self,
        max_entries: int = 512,
        clock: Callable[[], float] = time.monotonic,
    ) -> None:
        if max_entries < 1:
            raise ValueError("max_entries must be at least one")
        self._max_entries = max_entries
        self._clock = clock
        self._entries: OrderedDict[str, CacheEntry[ValueT]] = OrderedDict()

    async def get(self, key: str) -> ValueT | None:
        entry = self._entries.get(key)
        if entry is None:
            return None
        if entry.expires_at <= self._clock():
            del self._entries[key]
            return None
        self._entries.move_to_end(key)
        return entry.value

    async def set(self, key: str, value: ValueT, ttl_seconds: float) -> None:
        if not math.isfinite(ttl_seconds) or ttl_seconds <= 0:
            raise ValueError("ttl_seconds must be finite and greater than zero")

        self._purge_expired()
        self._entries[key] = CacheEntry(value=value, expires_at=self._clock() + ttl_seconds)
        self._entries.move_to_end(key)
        while len(self._entries) > self._max_entries:
            self._entries.popitem(last=False)

    async def clear(self) -> None:
        self._entries.clear()

    def _purge_expired(self) -> None:
        now = self._clock()
        expired = [key for key, entry in self._entries.items() if entry.expires_at <= now]
        for key in expired:
            del self._entries[key]
