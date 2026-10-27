@echo off
title SmartCharge AI - Backend Server
cd /d "%~dp0"
echo ===================================================
echo Starting SmartCharge AI Backend on http://127.0.0.1:8000
echo Swagger API Docs: http://127.0.0.1:8000/docs
echo ===================================================
echo.
.\.venv\Scripts\uvicorn.exe backend.app.main:app --host 127.0.0.1 --port 8000 --reload
pause
