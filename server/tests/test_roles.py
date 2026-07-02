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

def lookup_id_by_name(path: str, name: str) -> int:
    response = client.get(path)
    assert response.status_code == 200, response.text
    items = response.json()
    for item in items:
        if item.get("Name") == name:
            return item["Id"]
    raise AssertionError(f"Lookup value '{name}' not found at {path}")

new_tag = {
    "Id": None,
    "Name": random_text("Tag"),
    "Context": None,
    "IsActive": True,
    "Order": random.randint(1, 10)
}

new_Location = {
    "Id": None,
    "IsActive": True,
    "Order": random.randint(1, 10),
    "Country": random_text("Count"),
    "City": random_text("Cit")
}

new_RoleType = {
    "Id": None,
    "IsActive": True,
    "Order": random.randint(1, 10),
    "Name": random_text("RT")
}

new_WorkModel = {
    "Id": None,
    "IsActive": True,
    "Order": random.randint(1, 10),
    "Name": random_text("WM")
}

new_Benefit = {
    "Id": None,
    "IsActive": True,
    "Order": random.randint(1, 10),
    "Name": random_text("Ben")
}

new_Sources = {
    "Id": None,
    "Name": random_text("Src"),
    "PortalURL": f"https://example.com/{uuid.uuid4().hex}",
    "Details": random_text(f"Source text\nMore text"),
    "IsActive": True
}

new_PlaceOfWork = {
    "Id": None,
    "LocationId": None,
    "Address": random_text("Adr"),
    "IsActive": True
}

new_Contact = {
    "Id": None,
    "Name": random_text("Con"),
    "Email": random_text("email"),
    "Phone": random.randint(1000000000, 9999999999),
    "Details": "string",
    "IsActive": True
}

new_JobSpec = {
    "Id": None,
    "Position": random_text("Pos"),
    "Company": random_text("Comp"),
    "SourceId": None,
    "Link": f"https://example.com/{uuid.uuid4().hex}",
    "Description": random_text("Job description"),
    "PlaceOfWorkId": None,
    "WorkModelId": random.randint(1, 3),
    "RoleTypeId": random.randint(1, 3),
    "SalaryExpectation": None,
    "ContactId": None,
    "Published": None,
    "Created": datetime.utcnow().isoformat(),
    "ApplicationId": None,
    "IsActive": True,
}

new_Application = {
    "Id": None,
    "Applied": datetime.utcnow().isoformat(),
    "Confirmed": None,
    "Discarded": None,
    "Notes": random_text("App"),
    "IsActive": True
}

new_Interview = {
    "Id": None,
    "ApplicationId": None,
    "Scheduled": timedelta(days=+random.randint(1, 30), seconds=68400),
    "ContactId": None,
    "Notes": random_text("Int"),
    "Outcome": None,
    "Feedback": None,
    "IsActive": True
}

def test_luLocation_create_update() -> None:
    API_COMMAND = "/roles/lookup/locations"
    response = client.post(f"{API_PREFIX}{API_COMMAND}", json=new_Location)
    assert response.status_code == 200, response.text
    item = response.json()
    assert item["Id"] is not None
    item["Country"] = random_text("Count!")
    response = client.post(f"{API_PREFIX}{API_COMMAND}", json=item)
    assert response.status_code == 200, response.text
    assert response.json()["Country"] != new_Location["Country"]

def test_RoleType_create_update() -> None:
    API_COMMAND = "/roles/lookup/role-types"
    response = client.post(f"{API_PREFIX}{API_COMMAND}", json=new_RoleType)
    assert response.status_code == 200, response.text
    item = response.json()
    assert item["Id"] is not None
    item["Name"] = random_text("Pos!")
    response = client.post(f"{API_PREFIX}{API_COMMAND}", json=item)
    assert response.status_code == 200, response.text
    assert response.json()["Name"] != new_RoleType["Name"]




def test_jobspec_create_update() -> None:
    API_COMMAND = "/roles/job-specs"
    response = client.post(f"{API_PREFIX}{API_COMMAND}", json=new_JobSpec)
    assert response.status_code == 200, response.text
    item = response.json()
    assert item["Id"] is not None
    item["Position"] = random_text("RT!")
    response = client.post(f"{API_PREFIX}{API_COMMAND}", json=item)
    assert response.status_code == 200, response.text
    assert response.json()["Position"] != new_JobSpec["Position"]

