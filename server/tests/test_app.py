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


def test_system_setup_export_import_round_trip() -> None:
    export_response = client.get(f"{API_PREFIX}/system/backup/export")
    assert export_response.status_code == 200, export_response.text

    payload = export_response.json()
    assert isinstance(payload, dict)
    assert "app_settings" in payload
    assert "lookups" in payload
    assert any(item["Key"] == "db_version" for item in payload["app_settings"])

    import_payload = {
        "app_settings": [
            {
                "Key": "migration_test_setting",
                "Value": "enabled",
                "Notes": "Created by round-trip test",
                "IsActive": True,
            }
        ],
        "lookups": {
            "locations": [
                {
                    "Id": 999999,
                    "Country": "Migration",
                    "City": "Test",
                    "IsActive": True,
                    "Order": 1,
                }
            ],
            "role_types": [
                {
                    "Id": 999998,
                    "Name": "Migration Role Type",
                    "IsActive": True,
                    "Order": 1,
                }
            ],
            "work_models": [
                {
                    "Id": 999997,
                    "Name": "Migration Work Model",
                    "IsActive": True,
                    "Order": 1,
                }
            ],
            "benefits": [
                {
                    "Id": 999996,
                    "Name": "Migration Benefit",
                    "IsActive": True,
                    "Order": 1,
                }
            ],
            "sources": [
                {
                    "Id": 999995,
                    "Name": "Migration Source",
                    "ParentId": None,
                    "PortalURL": "https://example.com",
                    "Details": "Imported for migration test",
                    "IsActive": True,
                    "Order": 1,
                }
            ],
        },
    }

    import_response = client.post(
        f"{API_PREFIX}/system/backup/import",
        json=import_payload,
    )
    assert import_response.status_code == 200, import_response.text

    setting_response = client.get(f"{API_PREFIX}/app-settings/migration_test_setting")
    assert setting_response.status_code == 200, setting_response.text
    assert setting_response.json()["Value"] == "enabled"

    location_response = client.get(f"{API_PREFIX}/roles/lookup/locations/999999")
    assert location_response.status_code == 200, location_response.text
    assert location_response.json()["Country"] == "Migration"


def test_system_setup_export_import_file_round_trip(tmp_path) -> None:
    backup_file = tmp_path / "system_backup.json"

    export_response = client.get(
        f"{API_PREFIX}/system/backup/export-file",
        params={"file_path": str(backup_file)},
    )
    assert export_response.status_code == 200, export_response.text
    assert backup_file.exists()

    import_response = client.post(
        f"{API_PREFIX}/system/backup/import-file",
        params={"file_path": str(backup_file)},
    )
    assert import_response.status_code == 200, import_response.text
