# JobHunter: Centralized Job Application Management System

JobHunter is a centralized job application management system, aiming to provide a job seeker with a clear workflow when multiple applications need to be tracked. Information on the job specifications, applications, interviews and offers is stored allowing the user to access and compare easily. Also the job seeking portals may be managed and presented in a single screen.

---

## Table of Contents

| Section                               |
|---------------------------------------|
| [Overview](#overview)                 |
| [Architecture](#architecture)         |
| [Getting Started](#getting-started)   |
| [Installation](#installation)         |
| [Execution](#execution)               |
| [Contributing](#contributing)         |
| [License](#license)                   |

---

## Overview

JobHunter is a backend-first job application tracker built with Python, FastAPI, SQLModel, and SQLite. The service provides a stable API layer for storing job specifications, related contacts, applications, interviews, and lookup values such as locations, work models, role types, and benefits. And a user interface web app, bootstrapped with **Vite** for fast builds and uses React Router for navigation.

---

## Architecture

Following an MVC approach, the application is devide in two subprojects:

* Backend: deals with the data model and controller layers, a set of APIs are in charge of the data management and logic operations. These APIs are programmed in Python with FastAPI. The database being powered by SQLite and SQLModel.
* Frontend: is a web app that interacts between the API and the user. NodeJS application acting as interface.

Both elements are described in detail on their respectives folders.

---

## Getting Started

### Backend Prerequisites

* Python 3.10.20
* fastapi 0.115.0
* sqlmodel 0.0.22
* uvicorn 0.30.0
* pydantic 2.9.0
* httpx2 0.30.0
* sqlalchemy_utils 0.7.4

### Frontend Prerequisites

* Node ≥ 20
* npm 11.17

---

## Installation

```shell
git clone https://github.com/d-blanmor/JobHunter.git
```

### Backend

Open server folder

```shell
cd server
```

Create a virtual environment

```shell
python -m venv .venv
```

Install dependencies

```shell
.venv\Scripts\python -m pip install -r requirements.txt
```

Edit **config.ini** file

* api.pathname: API assigned call (default '/api')
* data.type: Database type, currently only sqlite.
* data.db: Connection string to the database, currently path to sqlite data fiel.
* pytest.testpaths: Folder for test suite.

### Frontend

Go to client-web folder

```shell
cd ..\client-web
```

Install dependencies

```shell
npm ci          # or `npm i` or `npm install`
```

### Setup

Return to the project folder

```shell
cd ..
```

Edit launch file **run_jobhunter.bat** and set the following fields as fitted:

| Variable  | Description                                                       |
|-----------|-------------------------------------------------------------------|
| api_host  | Ip address assigned to API server                                 |
| api_port  | Port that will listen API requests.                               |
| env       | Keep it empty for production environment, or dev for development  |

Open **client-web** folder and copy ".env.example" file, for instance to ".env"

```shell
cd .\client-web
copy .\.env.example .\.env
```

Edit **.env** file and set the values according to the API configuration:

| Variable          | Description                                               | Default   |
|-------------------|-----------------------------------------------------------|-----------|
| VITE_API_HOST     | Ip address the front end will use to call the API server  | 127.0.0.1 |
| VITE_API_PORT     | Port listening for API calls                              | 4171      |
| VITE_SERVER_HOST  | Host name (or IP address) for the user portal             | localhost |
| VITE_SERVER_PORT  | Port assigned to the user portal                          | 4170      |

> **Deployment** – The built `/dist` folder can be served by any static file host (Netlify, Vercel, GitHub Pages, etc.).
> If you use a reverse‑proxy or custom domain, configure the proxy to point API requests (`/api/*`) to your backend.

---

## Execution

Exectute the file **run_jobhunter.bat**. It will launch both the API engine and the frontend.

From a browser, open the url for user interface (default [http://localhost:4170](http://localhost:4170))

---

## Contributing

1. Fork the dev branch of the repository.
2. Create a feature branch: `git checkout -b feat/<short-description>`.
3. Commit your changes with meaningful messages (`feat: add new field`).
4. Push and open a Pull Request to dev.
5. The changes will be reviewed and moved to main.

---

## License

This project is licensed under the MIT License – see `LICENSE`.
