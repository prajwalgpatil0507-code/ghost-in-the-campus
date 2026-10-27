@echo off
title Ghost in the Campus - FastAPI Backend Server
cd /d "%~dp0backend"
echo ========================================================
echo   Ghost in the Campus - Backend Server (FastAPI)
echo   Connected to Ollama model: gemma4:e2b
echo ========================================================
echo.
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
pause
