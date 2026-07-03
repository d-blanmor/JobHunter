# JobHunter UI: Client Application Dashboard

JobHunter is a centralized job application management system. This client dashboard provides a user-friendly interface for interacting with the robust, backend-first JobHunter API. Its purpose is to transform complex data models into an intuitive experience for tracking job applications, managing profiles, and viewing career history.

## 🚀 Getting Started
### Technology Stack (Suggested)
- Framework: React / Next.js (or Vue/Angular)
- Language: TypeScript
- State Management: Redux Toolkit / Zustand
- Styling: Tailwind CSS or Material UI
- API Client: Axios or Fetch API

### Prerequisites

1. The JobHunter Backend must be running: http://127.0.0.1:8000
2. A local development environment configured for the chosen frontend framework.

## 🏗️ Architecture Overview
The UI follows a Client-Server architecture, acting as a Single Page Application (SPA) that communicates exclusively with the JobHunter API endpoints defined in README.md.

### Interaction Flow:
1. User interacts with a component (e.g., clicking "View Applications").
2. The frontend service layer constructs an HTTP request (GET, POST, DELETE).
3. The request is sent to the base API URL: http://127.0.0.1:8000/api/v1/repository/{entity}.
4. The UI handles the JSON response and updates the component state accordingly.

## 🧩 Core Modules & Features
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
- API Endpoints Used: /job-specs, /job-spec-benefits.
- Key Features:
    - Creation Form: Must capture Position, Company, Description, SourceId, WorkModelId, etc.
    - Relationship Handling: Needs dedicated components/modals to select related entities (e.g., selecting a PlaceOfWork from the Location Directory).
    - Benefits Linking: A component to manage the many-to-many relationship with LuBenefit via the LnkJobSpecBenefit endpoint.
3. Application Tracker (Application)
- Purpose: The central hub for tracking the lifecycle of a job application.
- API Endpoints Used: /applications, /interviews.
- Key Features:
    - Timeline View: A chronological view showing:
        1. Job Spec Details (Link to JobSpec).
        2. Application Date (Applied).
        3. Interview Stages (List of related Interview records).
        4. Status Updates (Notes, Outcome, etc.).
    - Filtering: Ability to filter by status (e.g., "Active," "Rejected," "Interviewing").
4. Directory Services (Lookup Entities)
These modules allow users to manage and view the lookup data that enriches job specs. They should use the standard list/create/read pattern.

- Locations (LuLocation): A searchable directory for countries and cities.
    - Action: Searchable list, ability to create new locations.
- Contacts (Contact): Management of personal or company contacts.
    - Action: CRUD interface for Name, Email, Phone.
- Sources (Source): Tracking where the job was found (e.g., LinkedIn, Company Website).
    - Action: Simple form to record Name and PortalURL.

## ⚙️ API Interaction Guidelines (Client Developer Notes)
When implementing any feature, adhere strictly to these rules:

1. Base URL: All requests must target http://127.0.0.1:8000/api/v1/repository/{entity}.
2. Active Records Only: By default, all list endpoints (GET /...) should include the ?active_only=true query parameter to respect soft deletion logic.
3. POST for Both Create & Update: The API uses a single POST endpoint for both creating new records (if no ID is provided) and updating existing ones (if an ID is provided).
4. Soft Deletes: Never assume a hard delete. Use the DELETE endpoint, which performs a soft delete by setting IsActive=false.

## 🛠️ Development Checklist
- Implement API service layer with robust error handling for HTTP status codes (400, 404, 500).
- Build reusable components for common elements: Date Pickers, Select/Dropdowns (for FK lookups), and Form Validation.
- Test the full CRUD cycle for all major entities (JobSpec, Location, Contact).

### installation
Run from client:
```shell
npm install
```

### execution
Run from client:
```shell
npm run dev
```