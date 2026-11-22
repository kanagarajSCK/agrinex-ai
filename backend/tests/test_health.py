from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_health_endpoint_returns_service_status() -> None:
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    assert response.json()["data"] == {"status": "ok", "service": "agrinex-api"}
    assert response.json()["request_id"] == response.headers["X-Request-ID"]


def test_root_index_returns_service_info() -> None:
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()["data"]
    assert data["service"] == "AgriNex AI API"
    assert data["status"] == "operational"
    assert data["docs_url"] == "/docs"
    assert "/health" in data["health_check"]
    assert response.json()["request_id"] == response.headers["X-Request-ID"]


def test_root_health_alias_returns_service_status() -> None:
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["data"] == {"status": "ok", "service": "agrinex-api"}
    assert response.json()["request_id"] == response.headers["X-Request-ID"]
