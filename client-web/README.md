# JobHunter UI: Client Application Dashboard

JobHunter is a centralized job application management system. This client dashboard provides a user-friendly interface for interacting with the robust, backend-first JobHunter API. Its purpose is to transform complex data models into an intuitive experience for tracking job applications, managing profiles, and viewing career history.

## Table of Contents

| Section                                   |
|-------------------------------------------|
|  [Overview](#overview)                    |
|  [Features](#features)                    |
|  [Tech Stack](#tech-stack)                |
|  [Getting Started](#getting-started)      |
|  [Build and Deploy](#build-and-deploy)    |
|  [API Integration](#api-integration)      |

---

## Overview

The application allows users to:

- Create, edit, and view **Job Specifications**, **Applications**, **Interviews** and **Offers**.
  - **Job Specification**: A role description that may be found in a job search portal (portal source), describing the vacancy at a company
  - **Application**: Occurs when the user sends a candidature to the company for the Job Spec, defined not just by the specification and when the action is taken, but also by the documentation provided by the candidate in form of cover letter and resume.
  - **Interview**: When an application proceeds, an interview between the candidate and the recruiter may be scheduled, this event is defined by the date and time scheduled, person of contact (currently only one contact, the organizer can be recorded), interview description, preparation for the interview, once is finished, the outcome can be tracked as well as a possible feedback from the interviewed. Multiple interviews may be linked to the same job application.
  - **Offer**: If the process is succesful, a Job Offer will be received and may be tracked defined by the date of the offer, salary and benefits offered and descriptive text. One offer will be tracked per job application.
  - **Discarded Applications**: Being from the candidate abandoning the application, by the company after an interview, or even by not accpeting an offer, will be also tracked.
- Source portal management, helping the user to keep basic details from job seeking portals, a parent-child structure provides the opportunity of nesting portals. these portals may be opened from the user interface itself.
- Manage **Contacts**, including recruiter details, potential interviewers, a contact may or not be linked to a source portal.
- Track application stages and workflow statuses, in a simple glance the user may see the number of job offers on each stage:
  - **Received**: contains the job specs found, no action have been taking yet but for the recording of the description. Each item on this stage may be editted, deleted, or progressed to the next stage.
  - **Applied**: when a role spec moves from received, a job application will be created, and the case will be automatically be tracked at this stage, the candidate has let the company know of the wish to cover the role, waiting for companies to evaluate the profile. Elements on this stage can be edited, progressed to the next stage when the employer shcedules an interview with the candidate, or discarded if either the candidate or the company decide not proceed any further, optionally the job application may be deleted, moving it back to the previous stage.
  - **Interview**: at this stage the candidate has been successful on scheduling an interview with the company after applying to a role. This stage may be composed of one or many interviews.
  - **Offer**: After an application and generally one or several interviews, if the company makes an offer, the case enters in this stage. This would be considered a final successful stage.
  - **Discarded**: Cases on Applied or further stages may, at any time, be discarded, either because the recruiting company discards the candidate, the candidate decides not to proceed further, or disagree on the offer. This is a final failed stage.
- Configure local data such as benefits, locations, role types, and work models via the *Settings* pages.
- Import/export job specs or integrate with external sources.

The UI follows a modular design:

```
src/
├─ api/           // HTTP clients for each REST endpoint
├─ components/    // Reusable UI pieces (Modal, Stage modal, etc.)
├─ defs/          // TypeScript interfaces, types and common tools
├─ pages/         // Route‑based page components
└─ styles/        // Global CSS + component‑level styling
```

The app is bootstrapped with **Vite** for fast builds and uses React Router for navigation.

---

## Features

| Feature                                                               | Status |
|-----------------------------------------------------------------------|--------|
| Workflow screen                                                       | ✅     |
| Source Portals                                                        | ✅     |
| Job Specs view                                                        | ✅     |
| Job Specs, Applications, Interviews and Offers edition                | ✅     |
| Job Spec tagging                                                      | 🏗️     |
| Job Spec / Offer benefit list                                         | 🏗️     |
| Ollama LLM model integration for Job Spec/Interview analysis          | 💡     |
| Contact management and address book                                   | 🏗️     |
| Settings for lookup tables (benefits, locations, roles, work models)  | ✅     |
| Global styling (base, job‑spec, modal, etc.)                          | ✅     |
| TypeScript typings throughout the code base                           | ✅     |
| Environment configuration via `.env.example`                          | ✅     |

---

## Tech Stack

| Layer                     | Technology                                                    |
|---------------------------|---------------------------------------------------------------|
| **Framework**             | React 18 + TypeScript                                         |
| **Build Tool**            | Vite (ESM)                                                    |
| **Routing**               | React Router v6                                               |
| **HTTP Client**           | Axios (via `src/api/*`)                                       |
| **State Management**      | Local component state & Context API (no Redux yet)            |
| **Styling**               | CSS Modules + global styles (`styles/*.css`)                  |
| **Linting/Formatting**    | ESLint + Prettier                                             |
| **Testing**               | Jest + React Testing Library (placeholders for future tests)  |

### Architecture Overview

The UI follows a Client-Server architecture, acting as a Single Page Application (SPA) that communicates exclusively with the JobHunter API endpoints defined in server README.md.

### Interaction Flow

1. User interacts with a component (e.g., clicking "View Applications").
2. The frontend service layer constructs an HTTP request (GET, POST, DELETE).
3. The request is sent to the base API URL: http://localhost:4171/api/v1/repository/{entity}.
4. The UI handles the JSON response and updates the component state accordingly.

### Core Modules & Features

The application should be structured around modules that map directly to the core entities managed by the API.

1. Dashboard (Landing Page) [`.\client-web\src\pages\HomePage.tsx`]

- Purpose: Provides a high-level overview of the user's job search activity.
- Data Sources: Aggregated data from Application, JobSpec, and Interview.
- Key Widgets:

  - Create a new case via Job Spec ingestion.
  - Workflow diagram with number of Job Specs per stage.
  - List and filtering of cases.
  - Interaction with cases in workflow stages.
  - Addition of portal sources.
  - List of portal sources with links to ease finding new job offers.

2. Job Specifications Creation [`.\client-web\src\pages\JobSpecCreate.tsx`]

- Purpose: Create job opportunities with the basic information for stage Received.
- Key Features:

  - Creation Form: Must capture Position, Company, Description, Source Portal, Work Model, etc.
  - Relationship Handling: Needs dedicated components/modals to select related entities (e.g., selecting a PlaceOfWork from the Location Directory).
  - Benefits Linking: A component to manage the many-to-many relationship with LuBenefit via the LnkJobSpecBenefit endpoint.

3. Job Specifications View [`.\client-web\src\pages\JobSpecView.tsx`]

- Purpose: Clean view of a Job Specification information, including stage details, application, interviews, offers, discarding details.
- Key Features:

  - Full view of a job spec, not just the initial details of receival, but also details of application, list of interviews, offer, depending on the stage of the case.

    1. Job Spec Details (Link to JobSpec).
    2. Application Date (Applied, descriptive text such as cover letter, resume, notes).
    3. Interview Stages (List of related Interview records, dates, contact, description, feedback).
    4. Status Updates (Notes, Outcome, etc.).

  - Hability to edit independently the sections.

4. Contact, address book management [`.\client-web\src\pages\Contacts.tsx`]

- Purpose: Address book with contacts linked to job specifications or interviews, these contacts may be linked to source portals.
- Key Features:

  - Provide contact information with search capabilities
  - Relationship of the contacts (source portal, job specs and interviews related, etc.)

5. Application Settings [`.\client-web\src\pages\settings\SettingsPage.tsx`]

These modules allow users to manage and view the lookup data that enriches job specs. They should use the standard list/create/read pattern.

- Source Portals [`.\client-web\src\pages\settings\Sources.tsx`]: Tracking where the job was found (e.g., LinkedIn, Company Website), allowing parent/child relationship, meant for a tree view providing quick link access to portals and subportals.
  - Action: Simple form to record Name, PortalURL, subportal relationship.

- Tags [`.\client-web\src\pages\settings\TagsPage.tsx`]: List of available tags that may be linked to jobSpecs.
  - Action: Form with a list of editable tags.

- Benefits [`.\client-web\src\pages\settings\LuBenefitsPage.tsx`]: list of possible benefits to be link to Job Specs and Offers separately.
  - Action: List of available benefits to be linked.

- Locations [`.\client-web\src\pages\settings\LuLocationsPage.tsx`]: A searchable directory for countries and cities.
  - Action: Searchable list, ability to create new locations.

- Role Types [`.\client-web\src\pages\settings\LuRoleTypesPage.tsx`]: Describing job offer type (Full-Time, contract, Permanent, etc.)
  - Action: List of Role Types that may be linked, creation, edition and deletion.

- Work Models [`.\client-web\src\pages\settings\LuWorkModelsPage.tsx`]: Description of the expected location (On site, Remote, Hybrid, etc.)
  - Action: Management of available work models, list, creation, edition, deletion.

6. Pop up sections in form of Modal components:

- Case stage [`.\client-web\src\components\StageModal.tsx`]: Modal listing the cases on the selected stage.
  - Action: filter job specs, access to case details, interact with the cases to move to different stages.

- Job Specification edition [`.\client-web\src\components\JobSpecModal.tsx`]: Modal to edit job spec definition.

- Application edition [`.\client-web\src\components\ApplicationModal.tsx`]: Modal to edit application details.

- Interview edition [`.\client-web\src\components\InterviewModal.tsx`]: Modal to edit interview information.

- Offer edition [`.\client-web\src\components\OfferModal.tsx`]: Modal to edit offer information.

- Contact edition [`.\client-web\src\components\OfferModal.tsx`]: Modal to create and edit contact information linked to cases.

- Place of Work edition [`.\client-web\src\components\OfferModal.tsx`]: Modal to create or edit place of work information.

- Source portal edition [`.\client-web\src\components\OfferModal.tsx`]: Modal to create or edit source portals on the fly.

---

## Getting Started

### Prerequisites

1. The JobHunter Backend API must be running: http://127.0.0.1:4171
2. **Node ≥ 20** and **npm** installed.

```bash
# 1. Clone the repo
git clone https://github.com/d-blanmor/JobHunter/client-web.git

cd client-web

# 2. Install dependencies
npm ci          # or `npm i` or `npm install`

# 3. Set up environment variables
copy .env.example .env.local   # Edit the file as required (API base URL, etc.)
```

> **Deployment** – The built `/dist` folder can be served by any static file host (Netlify, Vercel, GitHub Pages, etc.).
> If you use a reverse‑proxy or custom domain, configure the proxy to point API requests (`/api/*`) to your backend.

### Environment Variables

| Variable           | Description                                      | Example                           |
|--------------------|--------------------------------------------------|-----------------------------------|
| `VITE_API_HOST`    | Base host of the backend API JobHunter server    | `https://api.example.com`         |
| `VITE_API_HOST`    | port assigned to JobHunter server                | `https://api.example.com:4174`    |
| `VITE_SERVER_HOST` | UI client host                                   |                                   |
| `VITE_SERVER_PORT` | UI cliento port                                  |                                   |

Make sure the back‑end server is running and accessible before launching the front‑end.

---

## Build and Deploy

1. Run locally for development

```bash
npm run dev    # Opens http://localhost:5173 in your browser
```

2. Build for production

```bash
# Production build
npm run build    # Generates /dist

# Preview locally after building
npm run preview  # Serves the static assets on localhost:4170
```

---

## API Integration

All network calls are located under `src/api/*.ts`. Each file contains typed functions that return promises.  
Example:

```ts
// src/api/jobSpecs.ts
export const createJobSpec = (data: JobSpec) => api.post<JobSpec>('/job-specs', data);
```

If the API changes, update these modules accordingly. The client does **not** bundle any authentication logic; it relies on standard CORS headers or an external auth provider.

---
