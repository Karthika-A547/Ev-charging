@echo off
title SmartCharge AI - Frontend Server
cd /d "%~dp0frontend"
echo ===================================================
echo Starting SmartCharge AI Frontend on http://localhost:5173
echo ===================================================
echo.
npm run dev
pause
