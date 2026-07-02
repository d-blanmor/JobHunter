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

new_tag = {
    "Id": None,
    "Name": random_text("Tag"),
    "Context": "test",
    "IsActive": True,
    "Order": random.randint(1, 10)
}

def test_health_endpoint() -> None:
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}

def test_tag_create_update() -> None:
    response = client.post(f"{API_PREFIX}/tags", json=new_tag)
    assert response.status_code == 200, response.text
    tag = response.json()
    assert tag["Id"] is not None
    tag["Name"] = random_text("Tag!")
    response = client.post(f"{API_PREFIX}/tags", json=tag)
    assert response.status_code == 200, response.text
    assert response.json()["Name"] != new_tag["Name"]
    
def test_tag_list() -> None:
    response = client.get(f"{API_PREFIX}/tags")
    assert response.status_code == 200, response.text

def test_tag_list_by_id() -> None:
    response = client.get(f"{API_PREFIX}/tags/1")
    assert response.status_code == 200, response.text
    assert response.json()["Id"] != None

def test_tag_list_by_name() -> None:
    ltags = client.get(f"{API_PREFIX}/tags")
    response = client.get(f"{API_PREFIX}/tags/by-name/" + ltags.json()[0]["Name"])
    assert response.status_code == 200, response.text
    assert response.json()[0]["Id"] != None

def test_tag_list_by_context() -> None:
    response = client.get(f"{API_PREFIX}/tags/by-context/" + new_tag["Context"])
    assert response.status_code == 200, response.text
    assert response.json()[0]["Id"] != None

def test_delete_tag() -> None:
    tag = client.post(f"{API_PREFIX}/tags", json=new_tag)
    response = client.delete(f"{API_PREFIX}/tags/" + str(tag.json()["Id"]))
    assert response.status_code == 200, response.text
    assert response.json()["Id"] == response.json()["Id"] and not response.json()["IsActive"]
