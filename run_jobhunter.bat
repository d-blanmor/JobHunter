@echo off
set api_host="0.0.0.0"
set api_port="8000"
set env="dev"

cd server
START .venv\Scripts\uvicorn app.main:app --host %api_host% --port %api_port%

cd ..\client-web
START npm run %env%

