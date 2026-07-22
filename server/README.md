# JobHunter API: Centralized Job Application Management System

JobHunter is a centralized job application management system. This client dashboard provides a user-friendly interface for interacting with the robust, backend-first JobHunter API. Its purpose is to transform complex data models into an intuitive experience for tracking job applications, managing profiles, and viewing career history.

## Table of Contents

| Section                                   |
|-------------------------------------------|
|  [Overview](#overview)                    |
|  [Architecture](#architecture)            |
|  [Data Model](#data-model)                |
|  [API contract](#api-contract)            |
|  [Testing](#testing)                      |
|  [Notes for clients](#notes-for-clients)  |

---

## Overview

The system centralizes the management of:

- job specifications,
- applications and interviews,
- companies and work locations,
- lookup data used to classify roles and benefits.

The API is designed to be simple, predictable, and easy to consume from a web client, mobile app, or automation workflow.

---

## Architecture

### Database

- Sqlite is currently the only option.

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

## Data Model

The application uses a small relational model with lookup entities and core entities. There are two domain a global with **app** prefix or none, and rolespec specific marked with a prefix **roles**

Four kinds of data will be stored in the following tables:

- Lookup values: Marked with the string 'lu_' in the name of the table, all of them will have three fields, Id, IsActive and Order, a Name field will have the definition, however some lookups may be defined by other set of values, see below table definitions. An exception to the naming rule is tags, they may be considered as a lookup, however, is meant to act in a global application scope.
- Relationships (n2n): Can be spotted by the table name since it will contain the string 'lnk_'. These tables act as relational tables between entities or lookups. The common structure will have these fields primary key and secondary key corresponding to the id of the entities linked, Order, and in some cases Notes.
- Entity tables: The rest of the tables will have information that will define different entities
- Settings: is an unique table that could be considered on its own, Key defines the setting name and Value the setting option, Notes for user friendly description and soft deletion IsActive field.

Data deletion will be done as soft deletion, meaining the data will not be erased, but the column IsActive will define if the row is soft-deleted (value false) or not (value true).

There is however an exception to this rule, link tables will be hard deleted, since primary and secondary keys can't be duplicated, when a link is removed, the row will be deleted from the table.

### Data Structure

#### Lookup values

Here is a definition for each lookup table:

- `Tags`

  | Field      | Type    | Key                | Nullable |
  |------------|---------|--------------------|----------|
  | `Id`       | int     | PK, auto-increment | No       |
  | `Name`     | string  |                    | No       |
  | `Context`  | string  |                    | Yes      |
  | `IsActive` | boolean |                    | No       |
  | `Order`    | int     |                    | No       |

- `Roles_lu_Benefits`

  | Field      | Type    | Key                | Nullable |
  |------------|---------|--------------------|----------|
  | `Id`       | int     | PK, auto-increment | No       |
  | `Name`     | string  |                    | No       |
  | `IsActive` | boolean |                    | No       |
  | `Order`    | int     |                    | No       |

  Initial rows:

  | Id  | Name                 | IsActive | Order |
  |-----|----------------------|----------|-------|
  | 1   | Health Insurance     | 1        | 1     |
  | 2   | Pension Plan         | 1        | 2     |
  | 3   | Bonus                | 1        | 3     |
  | 4   | Vacation             | 1        | 4     |
  | 5   | Commuting allowance  | 1        | 5     |

- `Roles_lu_Locations`

  | Field      | Type    | Key                | Nullable |
  |------------|---------|--------------------|----------|
  | `Id`       | int     | PK, auto-increment | No       |
  | `Country`  | string  |                    | No       |
  | `City`     | string  |                    | Yes      |
  | `IsActive` | boolean |                    | No       |
  | `Order`    | int     |                    | No       |

  Initial rows:

  | Id  | Country      | City             | IsActive | Order |
  |-----|--------------|------------------|----------|-------|
  | 1   | Ireland      |                  | 1        | 1     |

- `Roles_lu_Role_Types`

  | Field      | Type    | Key                | Nullable |
  |------------|---------|--------------------|----------|
  | `Id`       | int     | PK, auto-increment | No       |
  | `Name`     | string  |                    | No       |
  | `IsActive` | boolean |                    | No       |
  | `Order`    | int     |                    | No       |

  Initial rows:

  | Id  | Name      | IsActive | Order |
  |-----|-----------|----------|-------|
  | 1   | Permanent | 1        | 1     |
  | 2   | Contract  | 1        | 2     |
  | 3   | Full-Time | 1        | 3     |

- `Roles_lu_Work_Models`

  | Field      | Type    | Key                | Nullable |
  |------------|---------|--------------------|----------|
  | `Id`       | int     | PK, auto-increment | No       |
  | `Name`     | string  |                    | No       |
  | `IsActive` | boolean |                    | No       |
  | `Order`    | int     |                    | No       |

  Initial rows:

  | Id  | Name    | IsActive | Order |
  |-----|---------|----------|-------|
  | 1   | On site | 1        | 1     |
  | 2   | Remote  | 1        | 2     |
  | 3   | Hybrid  | 1        | 3     |

#### Relationships

Link tables between entities:

- `Roles_lnk_JobSpec_Tags`

  | Field         | Type    | Key                         | Nullable |
  |---------------|---------|-----------------------------|----------|
  | `JobSpecId`   | int     | PK, FK Roles_Job_Specs.Id   | No       |
  | `TagId`       | int     | PK, FK Tags.Id              | No       |
  | `Order`       | int     |                             | No       |

- `Roles_lnk_JobSpecs_Benefits`

  | Field         | Type    | Key                         | Nullable |
  |---------------|---------|-----------------------------|----------|
  | `JobSpecId`   | int     | PK, FK Roles_Job_Specs.Id   | No       |
  | `LuBenefitId` | int     | PK, FK Roles_lu_Benefits.Id | No       |
  | `Notes`       | string  |                             | Yes      |
  | `Order`       | int     |                             | No       |

- `Roles_lnk_Offers_Benefits`

  | Field         | Type    | Key                         | Nullable |
  |---------------|---------|-----------------------------|----------|
  | `OfferId`     | int     | PK, FK Roles_Offers.Id      | No       |
  | `LuBenefitId` | int     | PK, FK Roles_lu_Benefits.Id | No       |
  | `Notes`       | string  |                             | Yes      |
  | `Order`       | int     |                             | No       |

#### Core entities

Main entities:

- `Roles_Sources`

  | Field               | Type     | Key                        | Nullable |
  |---------------------|----------|----------------------------|----------|
  | `Id`                | int      | PK                         | No       |
  | `Name`              | string   |                            | No       |
  | `ParentId`          | int      | FK Roles_Sources.Id        | Yes      |
  | `PortalURL`         | string   |                            | Yes      |
  | `Icon`              | blob     |                            | Yes      |
  | `Details`           | string   |                            | Yes      |
  | `IsActive`          | boolean  |                            | No       |
  | `Order`             | int      |                            | No       |

- `Roles_Places_Of_Work`

  | Field               | Type     | Key                        | Nullable |
  |---------------------|----------|----------------------------|----------|
  | `Id`                | int      | PK                         | No       |
  | `LocationId`        | int      | FK Roles_lu_Locations.Id   | No       |
  | `Address`           | string   |                            | Yes      |
  | `IsActive`          | boolean  |                            | No       |

- `Roles_Contacts`

  | Field               | Type     | Key                        | Nullable |
  |---------------------|----------|----------------------------|----------|
  | `Id`                | int      | PK                         | No       |
  | `Name`              | string   |                            | No       |
  | `Email`             | string   |                            | Yes      |
  | `Phone`             | string   |                            | Yes      |
  | `Details`           | string   |                            | Yes      |
  | `SourceId`          | int      | FK Roles_Sources.Id        | Yes      |
  | `IsActive`          | boolean  |                            | No       |

- `Roles_Job_Specs`

  | Field               | Type     | Key                        | Nullable |
  |---------------------|----------|----------------------------|----------|
  | `Id`                | int      | PK                         | No       |
  | `Position`          | string   |                            | No       |
  | `Company`           | string   |                            | Yes      |
  | `SourceId`          | int      | FK Roles_Sources.Id        | Yes      |
  | `Link`              | string   |                            | Yes      |
  | `PlaceOfWorkId`     | int      | FK Roles_Places_Of_Work.Id | Yes      |
  | `WorkModelId`       | int      | FK Roles_lu_Work_Models.Id | Yes      |
  | `RoleTypeId`        | int      | FK Roles_lu_Role_Types.Id  | Yes      |
  | `SalaryExpectation` | string   |                            | Yes      |
  | `ContactId`         | int      | FK Roles_Contacts.Id       | Yes      |
  | `Description`       | string   |                            | Yes      |
  | `Analysis`          | string   |                            | Yes      |
  | `Notes`             | string   |                            | Yes      |
  | `Published`         | datetime |                            | Yes      |
  | `Created`           | datetime |                            | No       |
  | `IsActive`          | boolean  |                            | No       |

- `Roles_Applications`

  | Field               | Type     | Key                        | Nullable |
  |---------------------|----------|----------------------------|----------|
  | `Id`                | int      | PK                         | No       |
  | `JobSpecId`         | int      | FK Roles_Job_Specs.Id      | No       |
  | `Applied`           | datetime |                            | No       |
  | `Confirmed`         | datetime |                            | Yes      |
  | `Discarded`         | datetime |                            | Yes      |
  | `Letter`            | string   |                            | Yes      |
  | `CV`                | string   |                            | Yes      |
  | `Notes`             | string   |                            | Yes      |
  | `IsActive`          | boolean  |                            | No       |

- `Roles_Interviews`

  | Field               | Type     | Key                        | Nullable |
  |---------------------|----------|----------------------------|----------|
  | `Id`                | int      | PK                         | No       |
  | `ApplicationId`     | int      | FK Roles_Applications.Id   | No       |
  | `Scheduled`         | datetime |                            | Yes      |
  | `ContactId`         | int      | FK Roles_Contacts.Id       | Yes      |
  | `Description`       | string   |                            | Yes      |
  | `Analysis`          | string   |                            | Yes      |
  | `Notes`             | string   |                            | Yes      |
  | `Outcome`           | string   |                            | Yes      |
  | `Feedback`          | string   |                            | Yes      |
  | `IsActive`          | boolean  |                            | No       |

- `Roles_Offers`

  | Field               | Type     | Key                        | Nullable |
  |---------------------|----------|----------------------------|----------|
  | `Id`                | int      | PK                         | No       |
  | `ApplicationId`     | int      | FK Roles_Applications.Id   | No       |
  | `Salary`            | string   |                            | Yes      |
  | `Description`       | string   |                            | Yes      |
  | `Notes`             | string   |                            | Yes      |
  | `IsActive`          | boolean  |                            | No       |

#### App Settings

Application settings:

- `app_Settings`

  | Field               | Type     | Key                        | Nullable |
  |---------------------|----------|----------------------------|----------|
  | `Key`               | string   | PK                         | No       |
  | `Value`             | string   |                            | Yes      |
  | `Notes`             | string   |                            | Yes      |
  | `IsActive`          | boolean  |                            | No       |

#### Views

- `vwWorkflow`: Used to populate workflow stages, the result contents one and only one JobSpec, regardless of relationships between other tables, providing also the information needed to identify the stage the job specification is on:

  - Received: JobSpecId defined AND ApplicationId, InterviewId and OfferId are undefined.
  - Applied: JobSpecId and ApplicationId are defined AND InterviewId and OfferId are undefined AND Discarded is undefined.
  - Interview: JobSpecId, ApplicationId and InterviewId are defined AND OfferId is undefined AND Discarded is undefined.
  - Offer: JobSpecId, ApplicationId and OfferId are defined AND Discarded is undefined.
  - Discarded: JobSpecId and ApplicationId are defined AND Discarded is defined.

  | Field           | Type     |
  |-----------------|----------|
  | `JobSpecId`     | int      |
  | `ApplicationId` | int      |
  | `InterviewId`   | int      |
  | `OfferId`       | int      |
  | `Position`      | string   |
  | `Company`       | string   |
  | `RoleTypeId`    | int      |
  | `WorkModelId`   | int      |
  | `Created`       | datetime |
  | `Applied`       | datetime |
  | `Discarded`     | datetime |
  | `Scheduled`     | datetime |
  | `Offered`       | datetime |

---

## API contract

The API is served under the base URL, configurable on the service initiation, by default would be [http://localhost:8000](http://localhost:8000).
Once the server is running, the public APIs may be seen and tested via swagger at [/docs#/](http://localhost:8000/docs#/).
Here is a list of the current APIs deffinitions:

### Health

- `app\routers\initiate.py`

  | Name            | Command       | Method  |
  |-----------------|---------------|---------|
  | Health Check    | `/v1/health`  | GET     |

### Lookup APIs

- `app\routers\tags.py`:

  | Name                  | Command                              | Method  |
  |-----------------------|--------------------------------------|---------|
  | List Tags             | `/v1/tags`                           | GET     |
  | Get Tag               | `/v1/tags/{tag_id}`                  | GET     |
  | Get Tag by name       | `/v1/tags/by-name/{tag_Name}`        | GET     |
  | Get Tags by context   | `/v1/tags/by-context/{tag_Context}`  | GET     |
  | Create or Update Tag  | `/v1/tags`                           | POST    |
  | Delete Tag            | `/v1/tags/{tag_id}`                  | DELETE  |

- `app\routers\roles\lu_benefits.py`:

  | Name                      | Command                                   | Method  |
  |---------------------------|-------------------------------------------|---------|
  | List Benefits             | `/v1/roles/lookup/benefits`               | GET     |
  | Get Benefit               | `/v1/roles/lookup/benefits/{benefit_id}`  | GET     |
  | Create or Update Benefit  | `/v1/roles/lookup/benefits`               | POST    |
  | Delete Benefit            | `/v1/roles/lookup/benefits/{benefit_id}`  | DELETE  |

- `app\routers\roles\lu_locations.py`:

  | Name                  | Command                                   | Method  |
  |-----------------------|-------------------------------------------|---------|
  | List Tags             | `v1/roles/lookup/locations`               | GET     |
  | Get Tag               | `v1/roles/lookup/locations/{location_id}` | GET     |
  | Create or Update Tag  | `v1/roles/lookup/locations`               | POST    |
  | Delete Tag            | `v1/roles/lookup/locations/{location_id}` | DELETE  |

- `app\routers\roles\lu_roletypes.py`:

  | Name                        | Command                                       | Method  |
  |-----------------------------|-----------------------------------------------|---------|
  | List Role Types             | `/v1/roles/lookup/role-types`                 | GET     |
  | Get Role Type               | `/v1/roles/lookup/role-types/{role_type_id}`  | GET     |
  | Create or Update Role Type  | `/v1/roles/lookup/role-types`                 | POST    |
  | Delete Role Type            | `/v1/roles/lookup/role-types/{role_type_id}`  | DELETE  |

- `app\routers\roles\lu_workmodels.py`:

  | Name                        | Command                                         | Method  |
  |-----------------------------|-------------------------------------------------|---------|
  | List Work Models            | `/v1/roles/lookup/work-models`                  | GET     |
  | Get Work Model              | `/v1/roles/lookup/work-models/{work_model_id}`  | GET     |
  | Create or Update Work Model | `/v1/roles/lookup/work-models`                  | POST    |
  | Delete Work Model           | `/v1/roles/lookup/work-models/{work_model_id}`  | DELETE  |

### Relationship APIs

- `app\routers\roles\lnk_jobspecs_benefits.py`:

  | Name                              | Command                                                     | Method  |
  |-----------------------------------|-------------------------------------------------------------|---------|
  | List JobSpecs-Benefits            | `/v1/roles/lnk/jobspecs-benefits`                           | GET     |
  | Get JobSpec-Benefit               | `/v1/roles/lnk/jobspec-benefit/{jobspec_id}/{benefit_id}`   | GET     |
  | Get Benefits from JobSpec         | `/v1/roles/lnk/jobspec-benefits/{jobspec_id}`               | GET     |
  | Get JobSpecs from Benefit         | `/v1/roles/lnk/jobspecs-benefit/{benefit_id}`               | GET     |
  | Create or Update JobSpec-Benefit  | `/v1/roles/lnk/jobspec-benefit`                             | POST    |
  | Delete Benefits from JobSpec      | `/v1/roles/lnk/jobspec-benefits/{jobspec_id}`               | DELETE  |
  | Delete JobSpecs from Benefit      | `/v1/roles/lnk/jobspecs-benefit/{benefit_id}`               | DELETE  |
  | Delete JobSpec-Benefit            | `/v1/roles/lnk/jobspecs-benefits/{jobspec_id}/{benefit_id}` | DELETE  |

- `app\routers\roles\lnk_offers_benefits.py`:

  | Name                            | Command                                                 | Method  |
  |---------------------------------|---------------------------------------------------------|---------|
  | List Offers-Benefits            | `/v1/roles/lnk/offers-benefits`                         | GET     |
  | Get Offer-Benefit               | `/v1/roles/lnk/offer-benefit/{offer_id}/{benefit_id}`   | GET     |
  | Get Benefits from Offer         | `/v1/roles/lnk/offer-benefits/{offer_id}`               | GET     |
  | Get Offers from Benefit         | `/v1/roles/lnk/offers-benefit/{benefit_id}`             | GET     |
  | Create or Update Offer-Benefit  | `/v1/roles/lnk/offer-benefit`                           | POST    |
  | Delete Benefits from Offer      | `/v1/roles/lnk/offer-benefits/{offer_id}`               | DELETE  |
  | Delete Offers from Benefit      | `/v1/roles/lnk/offers-benefit/{benefit_id}`             | DELETE  |
  | Delete Offer-Benefit            | `/v1/roles/lnk/offers-benefits/{offer_id}/{benefit_id}` | DELETE  |

- `app\routers\roles\lnk_jobspecs_tags.py`:

  | Name                              | Command                                         | Method  |
  |-----------------------------------|-------------------------------------------------|---------|
  | List JobSpecs-Tags            | `/v1/roles/lnk/jobspecs-tags`                       | GET     |
  | Get JobSpec-Tag               | `/v1/roles/lnk/jobspec-tag/{jobspec_id}/{tag_id}`   | GET     |
  | Get Tags from JobSpec         | `/v1/roles/lnk/jobspec-tags/{jobspec_id}`           | GET     |
  | Get JobSpecs from Tag         | `/v1/roles/lnk/jobspecs-tag/{tag_id}`               | GET     |
  | Create or Update JobSpec-Tag  | `/v1/roles/lnk/jobspec-tag`                         | POST    |
  | Delete Tags from JobSpec      | `/v1/roles/lnk/jobspec-tags/{jobspec_id}`           | DELETE  |
  | Delete JobSpecs from Tag      | `/v1/roles/lnk/jobspecs-tag/{tag_id}`               | DELETE  |
  | Delete JobSpec-Tag            | `/v1/roles/lnk/jobspecs-tags/{jobspec_id}/{tag_id}` | DELETE  |

### Entities APIs

- `app\routers\roles\sources.py`:

  | Name                    | Command                                   | Method  |
  |-------------------------|-------------------------------------------|---------|
  | List Sources            | `/v1/roles/sources`                       | GET     |
  | List main Sources       | `/v1/roles/sources-main`                  | GET     |
  | Get Source              | `/v1/roles/sources/{source_id}`           | GET     |
  | Get Sources by Parent   | `/v1/roles/sources/by-parent/{parent_id}` | GET     |
  | Create or Update Source | `/v1/roles/sources`                       | POST    |
  | Delete Source           | `/v1/roles/sources/{source_id}`           | DELETE  |

- `app\routers\roles\contacts.py`:

  | Name                     | Command                                    | Method  |
  |--------------------------|--------------------------------------------|---------|
  | List Contacts            | `/v1/roles/contacts`                       | GET     |
  | Get Contact              | `/v1/roles/contacts/{contact_id}`          | GET     |
  | Get Contact by Source    | `/v1/roles/contacts/by-source/{source_id}` | GET     |
  | Create or Update Contact | `/v1/roles/contacts`                       | POST    |
  | Delete Contact           | `/v1/roles/contacts/{contact_id}`          | DELETE  |

- `app\routers\roles\placesofwork.py`:

  | Name                           | Command                                        | Method  |
  |--------------------------------|------------------------------------------------|---------|
  | List Places of Work            | `/v1/roles/places-of-work`                     | GET     |
  | Get Place of Work              | `/v1/roles/places-of-work/{place_of_work_id}`  | GET     |
  | Create or Update Place of Work | `/v1/roles/places-of-work`                     | POST    |
  | Delete Place of Work           | `/v1/roles/places-of-work/{place_of_work_id}`  | DELETE  |

- `app\routers\roles\jobspecs.py`:

  | Name                      | Command                             | Method  |
  |---------------------------|-------------------------------------|---------|
  | List Job Specs            | `/v1/roles/job-specs`               | GET     |
  | Get Job Spec              | `/v1/roles/job-specs/{job_spec_id}` | GET     |
  | Create or Update Job Spec | `/v1/roles/job-specs`               | POST    |
  | Delete Job Spec           | `/v1/roles/job-specs/{job_spec_id}` | DELETE  |

- `app\routers\roles\applications.py`:

  | Name                         | Command                                          | Method  |
  |------------------------------|--------------------------------------------------|---------|
  | List Applications            | `/v1/roles/applications`                         | GET     |
  | Get Application              | `/v1/roles/applications`                         | GET     |
  | Get Applications by Job Spec | `/v1/roles/applications-by-jobspec/{jobspec_id}` | GET     |
  | Create or Update Application | `/v1/roles/applications`                         | POST    |
  | Delete Application           | `/v1/roles/applications/{application_id}`        | DELETE  |

- `app\routers\roles\interviews.py`:

  | Name                       | Command                                        | Method  |
  |----------------------------|------------------------------------------------|---------|
  | List Interviews            | `/v1/roles/interviews`                         | GET     |
  | Get Interview              | `/v1/roles/interviews/{interview_id}`          | GET     |
  | Get Interview by Job Spec  | `/v1/roles/interviews-by-jobspec/{jobspec_id}` | GET     |
  | Create or Update Interview | `/v1/roles/interviews`                         | POST    |
  | Delete Interview           | `/v1/roles/interviews/{interview_id}`          | DELETE  |

- `app\routers\roles\offers.py`:

  | Name                    | Command                                     | Method  |
  |-------------------------|---------------------------------------------|---------|
  | List Offers             | `/v1/roles/offers`                          | GET     |
  | Get Offer               | `/v1/roles/offers/{offer_id}`               | GET     |
  | Get Offers by Job Spec  | `/v1/roles/offers-by-jobspec/{jobspec_id}`  | GET     |
  | Create or Update Offer  | `/v1/roles/offers`                          | POST    |
  | Delete Offer            | `/v1/roles/offers/{offer_id}`               | DELETE  |

### App Settings and Logic APIs

- `app\routers\appSettings.py`:

  | Name                      | Command                   | Method  |
  |---------------------------|---------------------------|---------|
  | List Settings             | `/v1/app-settings`        | GET     |
  | Get Setting               | `/v1/app-settings/{key}`  | GET     |
  | Create or Update Setting  | `/v1/app-settings`        | POST    |
  | Delete Setting            | `/v1/app-settings/{key}`  | DELETE  |

- `app\routers\workflows\stages.py`:

  | Name                      | Command                         | Method  |
  |---------------------------|---------------------------------|---------|
  | List Job Specs Received   | `/v1/workflow/stages/received`  | GET     |
  | List Job Specs Applied    | `/v1/workflow/stages/applied`   | GET     |
  | List Job Specs Interview  | `/v1/workflow/stages/interview` | GET     |
  | List Job Specs Offer      | `/v1/workflow/stages/offer`     | GET     |
  | List Job Specs Discarded  | `/v1/workflow/stages/discarded` | GET     |

---

## Testing

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

## Notes for clients

Clients should assume:

- JSON is the response format,
- IDs are integers,
- soft-deleted records are not returned by default in list endpoints,
- POST is used for both create and update operations,
- DELETE is a soft delete operation rather than a hard removal.
