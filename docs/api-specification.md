# API Specification

Base path: `/api/v1`. JSON is the default format. New routes must have Pydantic request/response schemas, validated provider inputs, actionable non-sensitive errors, and automated tests.

## `GET /health`

No authentication. Returns `200 OK` when the FastAPI service can serve requests.

```json
{"status":"ok","service":"agrinex-api"}
```

No weather, market, AI, or advisory endpoint exists yet.
