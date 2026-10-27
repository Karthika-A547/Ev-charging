@echo off
title SmartCharge AI Launcher
cd /d "%~dp0"

echo ========================================================
echo        SmartCharge AI - Full-Stack Launcher
echo ========================================================
echo.
echo [1/2] Launching Backend Server on port 8000...
start "SmartCharge AI - Backend (Port 8000)" cmd /c "cd /d "%~dp0" && .\.venv\Scripts\uvicorn.exe backend.app.main:app --host 127.0.0.1 --port 8000 --reload"

echo [2/2] Launching Frontend Server on port 5173...
start "SmartCharge AI - Frontend (Port 5173)" cmd /c "cd /d "%~dp0frontend" && npm run dev"

echo.
echo ========================================================
echo   Services are starting up!
echo   - Web Application: http://localhost:5173
echo   - Backend API Docs: http://127.0.0.1:8000/docs
echo ========================================================
echo.
timeout /t 5
start http://localhost:5173
