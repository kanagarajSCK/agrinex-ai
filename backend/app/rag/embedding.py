import math
from typing import Protocol

from app.core.exceptions import EmbeddingProviderError


class EmbeddingProvider(Protocol):
    def embed(self, text: str, task_type: str) -> list[float]: ...


class DeterministicEmbeddingProvider:
    """Offline deterministic provider for tests and explicit local fallback."""

    def __init__(self, dimensions: int = 768) -> None:
        self._dimensions = dimensions

    def embed(self, text: str, task_type: str) -> list[float]:
        del task_type
        if not text.strip():
            raise EmbeddingProviderError()
        vector = [0.0] * self._dimensions
        for index, char in enumerate(text.strip().lower().encode("utf-8")):
            vector[index % self._dimensions] += (char % 29) / 29.0
        norm = math.sqrt(sum(value * value for value in vector))
        return [value / norm for value in vector] if norm else vector


class GoogleEmbeddingProvider:
    def __init__(
        self,
        api_key: str,
        model: str = "gemini-embedding-001",
        dimensions: int = 768,
        timeout_seconds: float = 20.0,
    ) -> None:
        self._api_key = api_key.strip()
        self._model = model.strip() or "gemini-embedding-001"
        self._dimensions = dimensions
        self._timeout_seconds = timeout_seconds

    def embed(self, text: str, task_type: str) -> list[float]:
        if not self._api_key:
            raise EmbeddingProviderError()
        if not text.strip():
            raise EmbeddingProviderError()
        try:
            from google import genai
            from google.genai import types

            client = genai.Client(
                api_key=self._api_key,
                http_options=types.HttpOptions(
                    api_version="v1beta",
                    timeout=int(self._timeout_seconds * 1000),
                ),
            )
            try:
                config = types.EmbedContentConfig(
                    task_type=task_type,
                    output_dimensionality=self._dimensions,
                )
            except Exception:
                config = types.EmbedContentConfig(
                    taskType=task_type,
                    outputDimensionality=self._dimensions,
                )
            response = client.models.embed_content(
                model=self._model,
                contents=text,
                config=config,
            )
            embeddings = getattr(response, "embeddings", None)
            if not embeddings:
                raise EmbeddingProviderError()
            values = getattr(embeddings[0], "values", None)
            if not isinstance(values, list) or len(values) != self._dimensions:
                raise EmbeddingProviderError()
            vector = [float(value) for value in values]
            if any(not math.isfinite(value) for value in vector):
                raise EmbeddingProviderError()
            return vector
        except EmbeddingProviderError:
            raise
        except Exception as exc:
            raise EmbeddingProviderError() from exc
