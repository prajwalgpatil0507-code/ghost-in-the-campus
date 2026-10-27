Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "  Ghost in the Campus - FastAPI Backend Server" -ForegroundColor Magenta
Write-Host "  Model: gemma4:e2b | Endpoint: http://localhost:8000" -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Cyan
Set-Location "$PSScriptRoot\backend"
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
