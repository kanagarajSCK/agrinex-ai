# API Specification

Base path: `/api/v1`. JSON is the default format. All operations are public and require no account or authentication. Responses use typed Pydantic schemas. Open-Meteo weather is live only for valid coordinate requests; no invented weather fallback is used.

Interactive OpenAPI documentation is available at `/docs` and `/redoc`; the JSON schema is `/api/v1/openapi.json`.

Every successful response includes a server-generated request ID:

```json
{"data":{"status":"ok","service":"agrinex-api"},"request_id":"<server-generated-id>"}
```

Errors use a stable envelope and do not echo submitted values:

```json
{
  "error": {
    "code": "INTEGRATION_NOT_CONFIGURED",
    "message": "The weather integration is not configured.",
    "request_id": "<server-generated-id>",
    "issues": []
  }
}
```

`X-Request-ID` is returned on responses. The server generates it and logs only request metadata; caller-supplied request IDs are not trusted.

## Endpoints

### `GET /health`

Returns `200 OK` with the service status. This endpoint checks the API process only; it does not assert that external providers are available.

### `GET /weather/current`

Required query parameters: `latitude` (`-90` to `90`) and `longitude` (`-180` to `180`). Returns current Open-Meteo conditions plus a short response context. Invalid coordinates return `422`.

### `GET /weather/forecast`

Required query parameters: `latitude` and `longitude`; optional `days` (`1` to `7`, default `7`). Returns coordinates, timezone, units, source attribution, retrieval timestamp, current conditions, and daily/hourly context.

### `GET /weather/hourly`

Required query parameters: `latitude` and `longitude`. Returns the Open-Meteo seven-day hourly forecast context.

### `POST /weather/forecast`

Compatibility route using typed `WeatherForecastRequest` with a coordinate pair and optional `days` from 1 to 7. City-only location requests are not geocoded in this phase and return validation errors.

## AGMARKNET market endpoints

- `GET /markets/commodities`: commodities actually represented in returned upstream records.
- `GET /markets/geographies`: states, districts, and markets actually represented in returned upstream records.
- `GET /markets/prices`: genuine data.gov.in records, with optional state, district, market, commodity, variety, grade, arrival-date, limit, and offset filters.
- `GET /markets/summary`: factual highest, lowest, range, record count, and latest arrival date for compatible rupees-per-quintal records.
- `GET /markets/trends`: explicitly reports trend availability as false until genuine verified historical records are supported.
- `POST /markets/search`: compatibility route with typed market filters.

Market prices remain in INR per quintal. `arrival_date` is the source-reported market arrival date; `retrieved_at` is the time AgriNex retrieved the provider response. `stale` means the latest arrival date is earlier than the current Asia/Kolkata date, not merely that a cache entry exists. Missing or invalid modal, ordering, numeric, or unit values are excluded. Different units are not mixed or converted.

Without `DATA_GOV_IN_API_KEY`, mandi requests return `503 MARKET_API_KEY_MISSING`. A real upstream 4xx/5xx or timeout returns a safe 502/504; HTTP and provider failures are not cached as successful market data.

### `POST /markets/search`

Request: `MarketSearchRequest` with a commodity, optional market/location, and optional result limit. Returns `503 INTEGRATION_NOT_CONFIGURED` until a mandi provider is selected and configured.

### `POST /assistant/questions`

Request: `AssistantQuestionRequest` with a bounded question, supported language code, and optional location. Returns `503 INTEGRATION_NOT_CONFIGURED` until an AI provider is selected and configured.

### `POST /assistant/chat`

Request: `AssistantChatRequest` with `message` (1–2000 characters), `language` (`en`, `ta`, `te`, `hi`), up to 10 bounded history messages, and optional explicit location context. Returns `AssistantChatResponse` with answer, language, intent, confidence label, clarification state, key points, recommendations, verified sources, data status and warnings.

The endpoint does not accept model names or tool names from the browser. Gemini tool calls are restricted to `get_weather` and `get_mandi_prices`, tool arguments are Pydantic-validated, and tool execution is capped by `ASSISTANT_MAX_TOOL_ITERATIONS`. Missing Gemini credentials return `503 GEMINI_API_KEY_MISSING`; quota returns `429 GEMINI_QUOTA_EXHAUSTED`, authentication/provider failures return `502`, timeouts return `504`, and invalid structured output returns `502 GEMINI_INVALID_OUTPUT`. Request bodies above `ASSISTANT_REQUEST_BODY_LIMIT_BYTES` return `413`; chat requests above the configured per-minute limit return `429 ASSISTANT_RATE_LIMIT_EXCEEDED`.

## Knowledge endpoints

- `GET /knowledge/documents`: lists indexed document manifest entries.
- `POST /knowledge/retrieve`: validates a query and optional metadata filters, performs a bounded source retrieval and reports whether evidence is sufficient.

Public ingestion is not exposed. Only the controlled CLI may ingest an approved source PDF.

## India location endpoints

- `GET /locations/states`
- `GET /locations/districts?state_code=...`
- `GET /locations/sub-districts?district_code=...`
- `GET /locations/places?district_code=...&query=...`
- `GET /locations/search?query=...`
- `GET /locations/{location_id}`
- `GET /locations/{location_id}/resolve`

Location responses include entity type, English/local name, LGD code, parent hierarchy fields and source metadata. With no imported LGD snapshot, lists return zero records rather than fabricated India coverage. Coordinate resolution returns snapshot coordinates or a single verified Open-Meteo geocoding match restricted to India. Ambiguity or missing coordinates return a not-found coordinate-resolution error.

### Error behavior

- `422 REQUEST_VALIDATION_ERROR`: invalid request; response includes field paths and error types, not raw values.
- `502 PROVIDER_ERROR`: provider adapter reports a safe, expected failure.
- `503 INTEGRATION_NOT_CONFIGURED`: the relevant external integration is unavailable by design.
- `504 PROVIDER_TIMEOUT`: configured provider call exceeded its timeout.
- `500 INTERNAL_ERROR`: unexpected server failure; implementation details are not returned.

`ALLOWED_ORIGINS` is a JSON list of explicit origins; wildcard origins are rejected. CORS credentials are disabled. CORS is not authentication or authorization.
