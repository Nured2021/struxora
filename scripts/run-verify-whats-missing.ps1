# =========================================
# STRUXORA – RUN + VERIFY WHAT'S MISSING
# =========================================
# Run from repo root: .\scripts\run-verify-whats-missing.ps1
# =========================================

cd C:\Users\ameli\struxora\struxora

Write-Host "`n[1] Do we have Docker?" -ForegroundColor Cyan
try { docker version | Out-Null; Write-Host "Docker OK" -ForegroundColor Green }
catch { Write-Host "Docker NOT available (install/start Docker Desktop)" -ForegroundColor Yellow }

Write-Host "`n[2] Is Postgres running on 5432?" -ForegroundColor Cyan
Test-NetConnection localhost -Port 5432

Write-Host "`n[3] Run the final database+API script..." -ForegroundColor Cyan
.\scripts\final-database-api-start.ps1
