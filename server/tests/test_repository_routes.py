from fastapi.testclient import TestClient

from app.main import app


client = TestClient(app)


def test_health_endpoint() -> None:
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_locations_crud_flow() -> None:
    create_response = client.post(
        "/api/v1/roles/lookup/locations",
        json={"Country": "Germany", "City": "Berlin", "IsActive": True, "Order": 2},
    )
    assert create_response.status_code == 200
    created = create_response.json()
    assert created["Country"] == "Germany"
    assert created["City"] == "Berlin"

    location_id = created["Id"]

    list_response = client.get("/api/v1/roles/lookup/locations")
    assert list_response.status_code == 200
    assert any(item["Id"] == location_id for item in list_response.json())

    get_response = client.get(f"/api/v1/roles/lookup/locations/{location_id}")
    assert get_response.status_code == 200
    assert get_response.json()["Id"] == location_id

    delete_response = client.delete(f"/api/v1/roles/lookup/locations/{location_id}")
    assert delete_response.status_code == 200
    assert delete_response.json()["Id"] == location_id
