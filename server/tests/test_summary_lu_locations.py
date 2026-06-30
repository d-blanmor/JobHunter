from fastapi.testclient import TestClient
from datetime import datetime

from app.main import app


client = TestClient(app)


def iso(dt: datetime) -> str:
    return dt.isoformat() + 'Z'


def test_job_spec_summary_flow() -> None:
    # Create a received job spec (no ApplicationId)
    recv_resp = client.post(
        "/api/v1/repository/job-specs",
        json={"Position": "Recv Role", "IsActive": True},
    )
    assert recv_resp.status_code == 200
    recv = recv_resp.json()

    # Create application for applied spec
    app_resp = client.post(
        "/api/v1/repository/applications",
        json={"Applied": iso(datetime.utcnow()), "IsActive": True},
    )
    assert app_resp.status_code == 200
    app_obj = app_resp.json()

    # Create job spec linked to application (applied)
    applied_resp = client.post(
        "/api/v1/repository/job-specs",
        json={"Position": "Applied Role", "ApplicationId": app_obj["Id"], "IsActive": True},
    )
    assert applied_resp.status_code == 200
    applied = applied_resp.json()

    # Create application and job spec for interview case
    app2_resp = client.post(
        "/api/v1/repository/applications",
        json={"Applied": iso(datetime.utcnow()), "IsActive": True},
    )
    app2 = app2_resp.json()
    interview_spec = client.post(
        "/api/v1/repository/job-specs",
        json={"Position": "Interview Role", "ApplicationId": app2["Id"], "IsActive": True},
    ).json()

    # Create an interview for app2
    int_resp = client.post(
        "/api/v1/repository/interviews",
        json={"ApplicationId": app2["Id"], "Scheduled": iso(datetime.utcnow()), "IsActive": True},
    )
    assert int_resp.status_code == 200

    # Create discarded application and job spec
    discarded_app = client.post(
        "/api/v1/repository/applications",
        json={"Applied": iso(datetime.utcnow()), "Discarded": iso(datetime.utcnow()), "IsActive": True},
    ).json()
    discarded_js = client.post(
        "/api/v1/repository/job-specs",
        json={"Position": "Discarded Role", "ApplicationId": discarded_app["Id"], "IsActive": True},
    ).json()

    # Check received specs
    r = client.get("/api/v1/repository/job-specs/received")
    assert r.status_code == 200
    ids = [j["Id"] for j in r.json()]
    assert recv["Id"] in ids

    # Check applied specs (should include applied, not interview or discarded)
    r = client.get("/api/v1/repository/job-specs/applied")
    assert r.status_code == 200
    ids = [j["Id"] for j in r.json()]
    assert applied["Id"] in ids
    assert interview_spec["Id"] not in ids
    assert discarded_js["Id"] not in ids

    # Check interview specs
    r = client.get("/api/v1/repository/job-specs/interview")
    assert r.status_code == 200
    ids = [j["Id"] for j in r.json()]
    assert interview_spec["Id"] in ids

    # Offers placeholder
    r = client.get("/api/v1/repository/job-specs/offers")
    assert r.status_code == 200
    assert r.json() == []

    # Discarded specs
    r = client.get("/api/v1/repository/job-specs/discarded")
    assert r.status_code == 200
    ids = [j["Id"] for j in r.json()]
    assert discarded_js["Id"] in ids

    # Applications by job spec
    r = client.get(f"/api/v1/repository/applications/by-job-spec/{applied['Id']}")
    assert r.status_code == 200
    apps = r.json()
    assert len(apps) == 1
    assert apps[0]["Id"] == applied["ApplicationId"] or apps[0]["Id"] == app_obj["Id"]

    # Interviews by application
    r = client.get(f"/api/v1/repository/interviews/by-application/{app2['Id']}")
    assert r.status_code == 200
    assert len(r.json()) >= 1

    # Interviews by job spec
    r = client.get(f"/api/v1/repository/interviews/by-job-spec/{interview_spec['Id']}")
    assert r.status_code == 200
    assert len(r.json()) >= 1
