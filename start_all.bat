@echo off
title Ghost in the Campus - Master Launcher
echo ======================================================================
echo          GHOST IN THE CAMPUS - SPECTRAL AI CAMPUS ASSISTANT
echo ======================================================================
echo.
echo [1/3] Checking Ollama service...
echo Make sure Ollama is running with: ollama run gemma4:e2b
echo.
echo [2/3] Starting FastAPI Backend on http://localhost:8000 ...
start "Ghost Campus Backend" cmd /c "%~dp0start_backend.bat"
timeout /t 2 /nobreak >nul
echo.
echo [3/3] Starting React Vite Frontend on http://localhost:5173 ...
start "Ghost Campus Frontend" cmd /c "%~dp0start_frontend.bat"
echo.
echo ======================================================================
echo   Both services are starting!
echo   Frontend: http://localhost:5173
echo   Backend:  http://localhost:8000
echo   API Docs: http://localhost:8000/docs
echo ======================================================================
echo.
pause
