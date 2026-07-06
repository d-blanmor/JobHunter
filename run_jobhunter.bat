@echo off
set host="0.0.0.0"
set api_port="8000"
set ui_port=""

cd server
START .venv\Scripts\uvicorn app.main:app --host %host% --port %api_port%

cd ..\client-web
START npm run dev

