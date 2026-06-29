# JobHunter API: Centralized Job Application Management System

JobHunter is a backend-first job application tracker built with Python, FastAPI, SQLModel, and SQLite. The service provides a stable API layer for storing job specifications, related contacts, applications, interviews, and lookup values such as locations, work models, role types, and benefits.

This repository is intended to act as both:
- a practical backend for local development, and
- a client-facing contract definition for future UI or automation integrations.

---

## 1. Purpose

The system centralizes the management of:
- job specifications,
- applications and interviews,
- companies and work locations,
- lookup data used to classify roles and benefits.

The API is designed to be simple, predictable, and easy to consume from a web client, mobile app, or automation workflow.

---

## 2. Architecture

### Stack
- Python 3.11+
- FastAPI
- SQLModel
- SQLAlchemy
- SQLite
- Uvicorn

### Design principles
- Backend-first API design
- Repository-style CRUD endpoints
- Soft delete via `IsActive = false`
- Simple JSON request/response model
- Local development-friendly persistence with SQLite

---

## 3. Data model overview

The application uses a small relational model with lookup entities and core entities.

### Lookup entities
These are used to categorize or enrich job specs.

- `LuLocation`
  - `Id` (int, PK, auto-increment)
  - `Country` (string)
  - `City` (string, optional)
  - `IsActive` (bool)
  - `Order` (int)

- `LuRoleType`
  - `Id` (int, PK, auto-increment)
  - `Name` (string)
  - `IsActive` (bool)
  - `Order` (int)

- `LuWorkModel`
  - `Id` (int, PK, auto-increment)
  - `Name` (string)
  - `IsActive` (bool)
  - `Order` (int)

- `LuBenefit`
  - `Id` (int, PK, auto-increment)
  - `Name` (string)
  - `IsActive` (bool)
  - `Order` (int)

### Core entities
- `Source`
  - `Id` (int, PK, auto-increment)
  - `Name` (string)
  - `PortalURL` (string, optional)
  - `Details` (string, optional)
  - `IsActive` (bool)

- `PlaceOfWork`
  - `Id` (int, PK, auto-increment)
  - `LocationId` (int, FK to `LuLocation`)
  - `Address` (string, optional)
  - `IsActive` (bool)

- `Contact`
  - `Id` (int, PK, auto-increment)
  - `Name` (string)
  - `Email` (string, optional)
  - `Phone` (string, optional)
  - `Details` (string, optional)
  - `IsActive` (bool)

- `Application`
  - `Id` (int, PK, auto-increment)
  - `Applied` (datetime)
  - `Confirmed` (datetime, optional)
  - `Discarded` (datetime, optional)
  - `Notes` (string, optional)
  - `IsActive` (bool)

- `JobSpec`
  - `Id` (int, PK, auto-increment)
  - `Position` (string)
  - `Company` (string, optional)
  - `SourceId` (int, FK to `Source`)
  - `Link` (string, optional)
  - `Description` (string, optional)
  - `PlaceOfWorkId` (int, FK to `PlaceOfWork`)
  - `WorkModelId` (int, FK to `LuWorkModel`)
  - `RoleTypeId` (int, FK to `LuRoleType`)
  - `SalaryExpectation` (string, optional)
  - `ContactId` (int, FK to `Contact`)
  - `Published` (datetime, optional)
  - `Created` (datetime)
  - `ApplicationId` (int, FK to `Application`)
  - `IsActive` (bool)

- `Interview`
  - `Id` (int, PK, auto-increment)
  - `ApplicationId` (int, FK to `Application`)
  - `Scheduled` (datetime, optional)
  - `ContactId` (int, FK to `Contact`)
  - `Notes` (string, optional)
  - `Outcome` (string, optional)
  - `Feedback` (string, optional)
  - `IsActive` (bool)

- `LnkJobSpecBenefit`
  - `JobSpecId` (int, composite PK)
  - `BenefitId` (int, composite PK)
  - `Notes` (string, optional)
  - `Order` (int)
  - `IsActive` (bool)

---

## 4. API contract

The API is served under the base URL:

- `http://127.0.0.1:8000`

### Health
- `GET /health`

Returns:
```json
{
  "status": "ok"
}

### Repository-style endpoints
The main CRUD routes follow this pattern:
- GET /api/v1/repository/{entity}
- GET /api/v1/repository/{entity}/{id}
- POST /api/v1/repository/{entity}
- DELETE /api/v1/repository/{entity}/{id}

Supported entities:
- locations
- role-types
- work-models
- benefits
- sources
- places-of-work
- contacts
- applications
- job-specs
- interviews
- job-spec-benefits

Example routes

Locations
- GET /api/v1/repository/locations
- GET /api/v1/repository/locations/{location_id}
- POST /api/v1/repository/locations
- DELETE /api/v1/repository/locations/{location_id}

Job specs
- GET /api/v1/repository/job-specs
- GET /api/v1/repository/job-specs/{job_spec_id}
- POST /api/v1/repository/job-specs
- DELETE /api/v1/repository/job-specs/{job_spec_id}

Query behavior
- GET list endpoints accept an active_only query parameter.
- By default, active_only=true returns only records where IsActive=true.
- DELETE performs a soft delete by setting IsActive=false.

Create/update behavior
- POST creates a new entity when no Id is provided.
- POST updates an existing entity if an Id is provided and the record exists.

---

## 5. Example requests

Create a location
```shell
curl -X POST "http://127.0.0.1:8000/api/v1/repository/locations" \
  -H "Content-Type: application/json" \
  -d '{
    "Country": "Germany",
    "City": "Berlin",
    "Order": 2
  }'
```

List active locations
```shell
curl "http://127.0.0.1:8000/api/v1/repository/locations"
```

Create a job spec
```shell
curl -X POST "http://127.0.0.1:8000/api/v1/repository/job-specs" \
  -H "Content-Type: application/json" \
  -d '{
    "Position": "Backend Engineer",
    "Company": "Example Corp",
    "SourceId": 1,
    "WorkModelId": 2,
    "RoleTypeId": 1,
    "Description": "Build APIs for a growing product team",
    "IsActive": true
  }'
```

---

## 6. Seed data

On startup, the app initializes the database and seeds initial lookup data, including sample values such as:
- Ireland
- Permanent
- Contract
- On site
- Remote
- Hybrid
- Health Insurance
- Pension Plan

---

## 7. Local development

Create a virtual environment
```shell
python -m venv .venv
```

Install dependencies
On Windows:
```shell
.venv\Scripts\python -m pip install -r requirements.txt
```

Run the API
```shell
.venv\Scripts\uvicorn app.main:app --host 127.0.0.1 --port 8000
```

Run tests
```shell
.venv\Scripts\python -m pytest -q
```

---

## 8. Testing
The repository includes smoke tests for:
- health endpoint availability,
- repository route availability,
- basic CRUD flow for locations.

To run the tests:
```shell
cd server
.venv\Scripts\python -m pytest -q
```

---

## 9. Notes for clients

Clients should assume:
- JSON is the response format,
- IDs are integers,
- soft-deleted records are not returned by default in list endpoints,
- POST is used for both create and update operations,
- DELETE is a soft delete operation rather than a hard removal.

---

## 10. Future direction

The current backend is intentionally simple and extensible. It is suitable for:
- a web frontend,
- a desktop client,
- mobile integrations,
- automation or import pipelines.

This README is intended to serve as a stable contract for future client development.

---

Last updated: 2026-06-28