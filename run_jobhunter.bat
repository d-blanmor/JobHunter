@echo off
set api_host="0.0.0.0"
set api_port="4171"

IF NOT EXIST ".\.deployed" (
    ECHO Installing Job Hunter API server...
    cd %~dp0\server
    IF NOT EXIST ".\.venv\" (
        python -m venv .venv
        virtualenv venv –python=python3.10
        if %errorlevel% neq 0 exit /b %errorlevel%
    )
    .\.venv\Scripts\python -m pip install -r requirements.txt

    ECHO Installing Job Hunter UI...
    cd %~dp0\client-web
    npm i
    IF NOT EXIST ".\.env" (
        copy .\.env.example .\.env
    )
    cd %~dp0
    <nul >".deployed" (set /p tv=)
)

cd %~dp0\server
START .venv\Scripts\uvicorn app.main:app --host %api_host% --port %api_port%

cd %~dp0\client-web
START npm run dev

