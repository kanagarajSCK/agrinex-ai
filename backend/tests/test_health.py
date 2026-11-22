from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_health_endpoint_returns_service_status() -> None:
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    assert response.json()["data"] == {"status": "ok", "service": "agrinex-api"}
    assert response.json()["request_id"] == response.headers["X-Request-ID"]
