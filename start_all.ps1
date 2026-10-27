Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host "         GHOST IN THE CAMPUS - SPECTRAL AI CAMPUS ASSISTANT           " -ForegroundColor Magenta
Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "[1/3] Verifying Ollama service..." -ForegroundColor Yellow
Write-Host "Ollama model: gemma4:e2b on http://localhost:11434" -ForegroundColor Gray
Write-Host ""
Write-Host "[2/3] Launching FastAPI Backend on http://localhost:8000 ..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-File", "$PSScriptRoot\start_backend.ps1"
Start-Sleep -Seconds 2
Write-Host ""
Write-Host "[3/3] Launching React Vite Frontend on http://localhost:5173 ..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-File", "$PSScriptRoot\start_frontend.ps1"
Write-Host ""
Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host "  Services launched in background windows!" -ForegroundColor Green
Write-Host "  Frontend: http://localhost:5173" -ForegroundColor White
Write-Host "  Backend:  http://localhost:8000" -ForegroundColor White
Write-Host "  API Docs: http://localhost:8000/docs" -ForegroundColor White
Write-Host "======================================================================" -ForegroundColor Cyan
