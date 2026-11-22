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

### `POST /markets/search`

Request: `MarketSearchRequest` with a commodity, optional market/location, and optional result limit. Returns `503 INTEGRATION_NOT_CONFIGURED` until a mandi provider is selected and configured.

### `POST /assistant/questions`

Request: `AssistantQuestionRequest` with a bounded question, supported language code, and optional location. Returns `503 INTEGRATION_NOT_CONFIGURED` until an AI provider is selected and configured.

### Error behavior

- `422 REQUEST_VALIDATION_ERROR`: invalid request; response includes field paths and error types, not raw values.
- `502 PROVIDER_ERROR`: provider adapter reports a safe, expected failure.
- `503 INTEGRATION_NOT_CONFIGURED`: the relevant external integration is unavailable by design.
- `504 PROVIDER_TIMEOUT`: configured provider call exceeded its timeout.
- `500 INTERNAL_ERROR`: unexpected server failure; implementation details are not returned.

`ALLOWED_ORIGINS` is a JSON list of explicit origins; wildcard origins are rejected. CORS credentials are disabled. CORS is not authentication or authorization.
