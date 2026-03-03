# =====================================
# STRUXORA - START API + DIAGNOSE
# =====================================
# Run this script. The API will run in THIS window (watch for errors).
# To test, open a SECOND PowerShell and run: Invoke-RestMethod http://localhost:3001/health

Set-Location "C:\Users\ameli\struxora\struxora"

Write-Host "`n1) Checking if port 3001 is already in use..." -ForegroundColor Cyan
netstat -ano | findstr :3001

Write-Host "`n2) Starting API on PORT=3001 (watch this window for errors)..." -ForegroundColor Cyan
$env:PORT = "3001"
pnpm --filter @struxora/api run start:dev
