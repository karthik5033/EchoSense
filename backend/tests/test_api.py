import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health_check_endpoint():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ONLINE"
    assert "version" in data
    assert data["lead_time_ms"] >= 340.0

def test_security_headers_middleware():
    response = client.get("/health")
    assert response.headers["X-Content-Type-Options"] == "nosniff"
    assert response.headers["X-Frame-Options"] == "DENY"
    assert response.headers["X-XSS-Protection"] == "1; mode=block"

def test_benchmark_performance_endpoint():
    response = client.get("/api/v1/analysis/benchmark/performance")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert "results" in data
    assert len(data["results"]) == 3
    for run in data["results"]:
        assert run["meets_realtime_threshold"] is True
        assert run["subsampled_landmark_vertices"] <= 1200
        assert run["total_ms"] < 500.0

def test_signals_list_endpoint():
    response = client.get("/api/v1/signals")
    assert response.status_code in [200, 401] # Depends on mock DB / session
