# JobHunter UI: Client Application Dashboard

JobHunter is a centralized job application management system. This client dashboard provides a user-friendly interface for interacting with the robust, backend-first JobHunter API. Its purpose is to transform complex data models into an intuitive experience for tracking job applications, managing profiles, and viewing career history.

## Table of Contents

| Section | Link |
|---------|------|
|  Overview | #overview |
|  Features | #features |
|  Tech Stack | #tech-stack |
|  Getting Started | #getting-started |
|  Build & Deploy | #build-and-deploy |
|  API Integration | #api-integration |
|  Contributing | #contributing |
|  License | #license |

---

## Overview

The application allows users to:

* Create, edit, and view **Job Specifications** and **Applications**.
* Manage **Contacts**, including recruiter details.
* Track interview stages and workflow statuses.
* Configure local data such as benefits, locations, role types, and work models via the *Settings* pages.
* Import/export job specs or integrate with external sources.

The UI follows a modular design:
```
src/
├─ api/           // HTTP clients for each REST endpoint
├─ components/    // Reusable UI pieces (Modal, Stage modal, etc.)
├─ defs/          // TypeScript interfaces & types
├─ pages/         // Route‑based page components
└─ styles/        // Global CSS + component‑level styling
```
The app is bootstrapped with **Vite** for fast builds and uses React Router for navigation.
---

## Features

| Feature | Status |
|---------|--------|
| Workflow screen | ✅ |
| Source Portals | ✅ |
| Job Specs, Applications, Interviews and Offers | ✅ |
| Settings for lookup tables (benefits, locations, roles, work models) | ✅ |
| Global styling (base, job‑spec, modal, etc.) | ✅ |
| TypeScript typings throughout the code base | ✅ |
| Environment configuration via `.env.example` | ✅ |
---

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Framework** | React 18 + TypeScript |
| **Build Tool** | Vite (ESM) |
| **Routing** | React Router v6 |
| **HTTP Client** | Axios (via `src/api/*`) |
| **State Management** | Local component state & Context API (no Redux yet) |
| **Styling** | CSS Modules + global styles (`styles/*.css`) |
| **Linting/Formatting** | ESLint + Prettier |
| **Testing** | Jest + React Testing Library (placeholders for future tests) |
---

### Architecture Overview
The UI follows a Client-Server architecture, acting as a Single Page Application (SPA) that communicates exclusively with the JobHunter API endpoints defined in README.md.

### Interaction Flow:
1. User interacts with a component (e.g., clicking "View Applications").
2. The frontend service layer constructs an HTTP request (GET, POST, DELETE).
3. The request is sent to the base API URL: http://127.0.0.1:8000/api/v1/repository/{entity}.
4. The UI handles the JSON response and updates the component state accordingly.

### Core Modules & Features
The application should be structured around modules that map directly to the core entities managed by the API.

1. Dashboard (Landing Page)
- Purpose: Provides a high-level overview of the user's job search activity.
- Data Sources: Aggregated data from Application, JobSpec, and Interview.
- Key Widgets:
    - Total Applications Count (Count of active records in Application).
    - Upcoming Interviews (List of Interview records with Scheduled dates).
    - Recent Job Specs Viewed/Applied To.
2. Job Specifications Management (JobSpec)
- Purpose: View, create, and edit details for job opportunities.
- Key Features:
    - Creation Form: Must capture Position, Company, Description, Source Portal, Work Model, etc.
    - Relationship Handling: Needs dedicated components/modals to select related entities (e.g., selecting a PlaceOfWork from the Location Directory).
    - Benefits Linking: A component to manage the many-to-many relationship with LuBenefit via the LnkJobSpecBenefit endpoint.
3. Application Tracker (Application)
- Purpose: The central hub for tracking the lifecycle of a job application.
- Key Features:
    - Timeline View: A chronological view showing:
        1. Job Spec Details (Link to JobSpec).
        2. Application Date (Applied).
        3. Interview Stages (List of related Interview records).
        4. Status Updates (Notes, Outcome, etc.).
    - Filtering: Ability to filter by status (e.g., "Active," "Rejected," "Interviewing").
4. Directory Services (Lookup Entities)
These modules allow users to manage and view the lookup data that enriches job specs. They should use the standard list/create/read pattern.

- Source Portals (source): Tracking where the job was found (e.g., LinkedIn, Company Website), allowing parent/child relationship, meant for a tree view providing quick link access to portals and subportals.
    - Action: Simple form to record Name, PortalURL, subportal relationship.
- Tags (Tag): List of available tags that may be linked to jobSpecs.
    - Action: Form with a list of editable tags.
- Benefits (LuBenefit): list of possible benefits to be link to Job Specs and Offers separately.
    - Action: List of available benefits to be linked.
- Locations (LuLocation): A searchable directory for countries and cities.
    - Action: Searchable list, ability to create new locations.
- Role Types (RoleType): Describing job offer type (Full-Time, contract, Permanent, etc.)
    - Action: 
- Work Models (LuWorkModel): Description of the expected location (On site, Remote, Hybrid, etc.)
    - Action:
- Contacts (Contact): Management of personal or company contacts.
    - Action: CRUD interface for Name, Email, Phone.

## Getting Started

### Prerequisites

1. The JobHunter Backend API must be running: http://127.0.0.1:8000
2. **Node ≥ 20** and **npm** installed.

```bash
# 1. Clone the repo
git clone https://github.com/d-blanmor/JobHunter/client-web.git

cd client-web

# 2. Install dependencies
npm ci          # or `npm i` or `npm install`

# 3. Set up environment variables
cd .env.example .env.local   # Edit the file as required (API base URL, etc.)
```

> **Deployment** – The built `/dist` folder can be served by any static file host (Netlify, Vercel, GitHub Pages, etc.).
> If you use a reverse‑proxy or custom domain, configure the proxy to point API requests (`/api/*`) to your backend.
---

### Environment Variables

| Variable | Description |
|----------|-------------|
| `VITE_API_HOST` | Base host of the backend API JobHunter server (e.g., `https://api.example.com`) |
| `VITE_API_HOST` | port assigned to JobHunter server (e.g., `https://api.example.com:4174`) |
| `VITE_SERVER_HOST` | UI client host |
| `VITE_SERVER_PORT` | UI cliento port |


Make sure the back‑end server is running and accessible before launching the front‑end.
---

## Build & Deploy

1. Run locally for development
```bash
npm run dev    # Opens http://localhost:5173 in your browser
```

2. Build for production
```bash
# Production build
npm run build    # Generates /dist

# Preview locally after building
npm run preview  # Serves the static assets on localhost:4173
```

## API Integration

All network calls are located under `src/api/*.ts`. Each file contains typed functions that return promises.  
Example:
```ts
// src/api/jobSpecs.ts
export const createJobSpec = (data: JobSpec) => api.post<JobSpec>('/job-specs', data);
```
If the API changes, update these modules accordingly. The client does **not** bundle any authentication logic; it relies on standard CORS headers or an external auth provider.
---

## Contributing

1. Fork the repository.
2. Create a feature branch: `git checkout -b feat/<short-description>`.
3. Commit your changes with meaningful messages (`feat: add new field`).
4. Push and open a Pull Request.

### Code of Conduct

Please be respectful. All contributors must adhere to our [Code of Conduct](CODE_OF_CONDUCT.md).
---

## License

This project is licensed under the MIT License – see `LICENSE`.
---