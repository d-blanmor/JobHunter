import uuid
import random
from typing import Any
from datetime import datetime, timedelta
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

API_PREFIX = "/api/v1"

def random_text(prefix: str) -> str:
    return f"{prefix}-{uuid.uuid4().hex[:8]}"

def test_health_endpoint() -> None:
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}

def test_stage_received() -> None:
    response = client.get(f"{API_PREFIX}/workflow/stages/received")
    assert response.status_code == 200, response.text

def test_stage_applied() -> None:
    response = client.get(f"{API_PREFIX}/workflow/stages/applied")
    assert response.status_code == 200, response.text

def test_stage_interview() -> None:
    response = client.get(f"{API_PREFIX}/workflow/stages/interview")
    assert response.status_code == 200, response.text

def test_stage_offer() -> None:
    response = client.get(f"{API_PREFIX}/workflow/stages/offer")
    assert response.status_code == 200, response.text

def test_stage_discarded() -> None:
    response = client.get(f"{API_PREFIX}/workflow/stages/discarded")
    assert response.status_code == 200, response.text
