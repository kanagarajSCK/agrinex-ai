# API Specification

Base path: `/api/v1`. JSON is the default format. All operations are public and require no account or authentication. Responses use typed Pydantic schemas. Provider integrations are intentionally not configured; no endpoint returns invented live data or makes external/paid requests.

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

### `POST /weather/forecast`

Request: `WeatherForecastRequest` with a `location` (city, district, or coordinate pair) and optional `days` from 1 to 7. Returns `503 INTEGRATION_NOT_CONFIGURED` until a weather provider is selected and configured.

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
