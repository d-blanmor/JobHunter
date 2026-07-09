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
    "IsActive": True,
}

new_Application = {
    "Id": None,
    "JobSpecId": None,
    "Applied": datetime.utcnow().isoformat(),
    "Confirmed": None,
    "Discarded": None,
    "Notes": random_text("App"),
    "IsActive": True
}

new_Interview = {
    "Id": None,
    "ApplicationId": None,
    "Scheduled": datetime.utcnow().isoformat(),
    "ContactId": None,
    "Notes": random_text("Int"),
    "Outcome": None,
    "Feedback": None,
    "IsActive": True
}

new_Offer = {
    "Id": None,
    "ApplicationId": None,
    "Offered": datetime.utcnow().isoformat(),
    "Salary": None,
    "Notes": random_text("offd"),
    "IsActive": True
}

def test_stage_received() -> None:
    # Create a new JobSpec
    response = client.post(f"{API_PREFIX}/roles/job-specs", json=new_JobSpec)
    assert response.status_code == 200, response.text
    jobSpec = response.json()
    assert jobSpec["Id"] is not None
    
    # The JobSpec in stage Received
    response = client.get(f"{API_PREFIX}/workflow/stages/received")
    assert response.status_code == 200, response.text
    assert any(i["JobSpecId"] == jobSpec["Id"] for i in response.json())

    # The JobSpec NOT in stage Applied
    response = client.get(f"{API_PREFIX}/workflow/stages/applied")
    assert response.status_code == 200, response.text
    assert not(any(i["JobSpecId"] == jobSpec["Id"] for i in response.json()))

    # The JobSpec NOT in stage Interview
    response = client.get(f"{API_PREFIX}/workflow/stages/interview")
    assert response.status_code == 200, response.text
    assert not(any(i["JobSpecId"] == jobSpec["Id"] for i in response.json()))
    
    # The JobSpec NOT in stage Offered
    response = client.get(f"{API_PREFIX}/workflow/stages/offer")
    assert response.status_code == 200, response.text
    assert not(any(i["JobSpecId"] == jobSpec["Id"] for i in response.json()))

    # The JobSpec NOT in stage Discarded
    response = client.get(f"{API_PREFIX}/workflow/stages/discarded")
    assert response.status_code == 200, response.text
    assert not(any(i["JobSpecId"] == jobSpec["Id"] for i in response.json()))

def test_stage_applied() ->None:
    # Create a new JobSpec
    response = client.post(f"{API_PREFIX}/roles/job-specs", json=new_JobSpec)
    assert response.status_code == 200, response.text
    jobSpec = response.json()
    assert jobSpec["Id"] is not None

    # Applicate the Jobspec
    new_Application["JobSpecId"] = jobSpec["Id"]
    response = client.post(f"{API_PREFIX}/roles/applications", json=new_Application)
    assert response.status_code == 200, response.text
    appl = response.json()
    assert appl["Id"] is not None
    
    # The JobSpec NOT in stage Received
    response = client.get(f"{API_PREFIX}/workflow/stages/received")
    assert response.status_code == 200, response.text
    assert not(any(i["JobSpecId"] == jobSpec["Id"] for i in response.json()))

    # The JobSpec in stage Applied
    response = client.get(f"{API_PREFIX}/workflow/stages/applied")
    assert response.status_code == 200, response.text
    assert any(i["JobSpecId"] == jobSpec["Id"] for i in response.json())

    # The JobSpec NOT in stage Interview
    response = client.get(f"{API_PREFIX}/workflow/stages/interview")
    assert response.status_code == 200, response.text
    assert not(any(i["JobSpecId"] == jobSpec["Id"] for i in response.json()))
    
    # The JobSpec NOT in stage Offered
    response = client.get(f"{API_PREFIX}/workflow/stages/offer")
    assert response.status_code == 200, response.text
    assert not(any(i["JobSpecId"] == jobSpec["Id"] for i in response.json()))

    # The JobSpec NOT in stage Discarded
    response = client.get(f"{API_PREFIX}/workflow/stages/discarded")
    assert response.status_code == 200, response.text
    assert not(any(i["JobSpecId"] == jobSpec["Id"] for i in response.json()))

def test_stage_interview() ->None:
    # Create a new JobSpec
    response = client.post(f"{API_PREFIX}/roles/job-specs", json=new_JobSpec)
    assert response.status_code == 200, response.text
    jobSpec = response.json()
    assert jobSpec["Id"] is not None

    # Applicate the Jobspec
    new_Application["JobSpecId"] = jobSpec["Id"]
    response = client.post(f"{API_PREFIX}/roles/applications", json=new_Application)
    assert response.status_code == 200, response.text
    appl = response.json()
    assert appl["Id"] is not None
    
    # Schedule Interview
    new_Interview["ApplicationId"] = appl["Id"]
    response = client.post(f"{API_PREFIX}/roles/interviews", json=new_Interview)
    assert response.status_code == 200, response.text
    intv = response.json()
    assert intv["Id"] is not None 

    # The JobSpec NOT in stage Received
    response = client.get(f"{API_PREFIX}/workflow/stages/received")
    assert response.status_code == 200, response.text
    assert not(any(i["JobSpecId"] == jobSpec["Id"] for i in response.json()))
    
    # The JobSpec NOT in stage Applied
    response = client.get(f"{API_PREFIX}/workflow/stages/applied")
    assert response.status_code == 200, response.text
    assert not(any(i["JobSpecId"] == jobSpec["Id"] for i in response.json()))

    # The JobSpec in stage Interview
    response = client.get(f"{API_PREFIX}/workflow/stages/interview")
    assert response.status_code == 200, response.text
    assert any(i["JobSpecId"] == jobSpec["Id"] for i in response.json())

    # The JobSpec NOT in stage Offered
    response = client.get(f"{API_PREFIX}/workflow/stages/offer")
    assert response.status_code == 200, response.text
    assert not(any(i["JobSpecId"] == jobSpec["Id"] for i in response.json()))

    # The JobSpec NOT in stage Discarded
    response = client.get(f"{API_PREFIX}/workflow/stages/discarded")
    assert response.status_code == 200, response.text
    assert not(any(i["JobSpecId"] == jobSpec["Id"] for i in response.json()))

def test_stage_offer() ->None:
    # Create a new JobSpec
    response = client.post(f"{API_PREFIX}/roles/job-specs", json=new_JobSpec)
    assert response.status_code == 200, response.text
    jobSpec = response.json()
    assert jobSpec["Id"] is not None

    # Applicate the Jobspec
    new_Application["JobSpecId"] = jobSpec["Id"]
    response = client.post(f"{API_PREFIX}/roles/applications", json=new_Application)
    assert response.status_code == 200, response.text
    appl = response.json()
    assert appl["Id"] is not None

    # Schedule Interview
    new_Interview["ApplicationId"] = appl["Id"]
    response = client.post(f"{API_PREFIX}/roles/interviews", json=new_Interview)
    assert response.status_code == 200, response.text
    intv = response.json()
    assert intv["Id"] is not None 

    # Create an Offer
    new_Offer["ApplicationId"] = appl["Id"]
    response = client.post(f"{API_PREFIX}/roles/offers", json=new_Offer)
    assert response.status_code == 200, response.text
    offr = response.json()
    assert offr["Id"] is not None

    # The JobSpec NOT in stage Received
    response = client.get(f"{API_PREFIX}/workflow/stages/received")
    assert response.status_code == 200, response.text
    assert not(any(i["JobSpecId"] == jobSpec["Id"] for i in response.json()))
    
    # The JobSpec NOT in stage Applied
    response = client.get(f"{API_PREFIX}/workflow/stages/applied")
    assert response.status_code == 200, response.text
    assert not(any(i["JobSpecId"] == jobSpec["Id"] for i in response.json()))

    # The JobSpec NOT in stage Interview
    response = client.get(f"{API_PREFIX}/workflow/stages/interview")
    assert response.status_code == 200, response.text
    assert not(any(i["JobSpecId"] == jobSpec["Id"] for i in response.json()))

    # The JobSpec in stage Offered
    response = client.get(f"{API_PREFIX}/workflow/stages/offer")
    assert response.status_code == 200, response.text
    assert any(i["JobSpecId"] == jobSpec["Id"] for i in response.json())

    # The JobSpec NOT in stage Discarded
    response = client.get(f"{API_PREFIX}/workflow/stages/discarded")
    assert response.status_code == 200, response.text
    assert not(any(i["JobSpecId"] == jobSpec["Id"] for i in response.json()))

def test_stage_discarded() ->None:
    # Create a new JobSpec
    response = client.post(f"{API_PREFIX}/roles/job-specs", json=new_JobSpec)
    assert response.status_code == 200, response.text
    jobSpec = response.json()
    assert jobSpec["Id"] is not None

    # Applicate the Jobspec
    new_Application["JobSpecId"] = jobSpec["Id"]
    response = client.post(f"{API_PREFIX}/roles/applications", json=new_Application)
    assert response.status_code == 200, response.text
    appl = response.json()
    assert appl["Id"] is not None
    
    # Schedule Interview
    new_Interview["ApplicationId"] = appl["Id"]
    response = client.post(f"{API_PREFIX}/roles/interviews", json=new_Interview)
    assert response.status_code == 200, response.text
    intv = response.json()
    assert intv["Id"] is not None 

    # Discard Application
    appl["Discarded"] = datetime.utcnow().isoformat()
    response = client.post(f"{API_PREFIX}/roles/applications", json=appl)
    assert response.status_code == 200, response.text
    assert response.json()["Discarded"] is not None

    # The JobSpec NOT in stage Received
    response = client.get(f"{API_PREFIX}/workflow/stages/received")
    assert response.status_code == 200, response.text
    assert not(any(i["JobSpecId"] == jobSpec["Id"] for i in response.json()))
    
    # The JobSpec NOT in stage Applied
    response = client.get(f"{API_PREFIX}/workflow/stages/applied")
    assert response.status_code == 200, response.text
    assert not(any(i["JobSpecId"] == jobSpec["Id"] for i in response.json()))

    # The JobSpec NOT in stage Interview
    response = client.get(f"{API_PREFIX}/workflow/stages/interview")
    assert response.status_code == 200, response.text
    assert not(any(i["JobSpecId"] == jobSpec["Id"] for i in response.json()))

    # The JobSpec NOT in stage Offered
    response = client.get(f"{API_PREFIX}/workflow/stages/offer")
    assert response.status_code == 200, response.text
    assert not(any(i["JobSpecId"] == jobSpec["Id"] for i in response.json()))

    # The JobSpec in stage Discarded
    response = client.get(f"{API_PREFIX}/workflow/stages/discarded")
    assert response.status_code == 200, response.text
    assert any(i["JobSpecId"] == jobSpec["Id"] for i in response.json())
