import asyncio
from collections.abc import Awaitable
from hashlib import sha256
from typing import TypeVar

from pydantic import BaseModel

from app.core.exceptions import ProviderTimeoutError


ResultT = TypeVar("ResultT")


async def call_with_timeout(
    provider_name: str,
    operation: Awaitable[ResultT],
    timeout_seconds: float,
) -> ResultT:
    try:
        return await asyncio.wait_for(operation, timeout=timeout_seconds)
    except TimeoutError as exc:
        raise ProviderTimeoutError(provider_name) from exc


def request_cache_key(namespace: str, request: BaseModel) -> str:
    digest = sha256(request.model_dump_json().encode("utf-8")).hexdigest()
    return f"{namespace}:{digest}"
