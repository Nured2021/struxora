# =====================================
# STRUXORA - START API + TEST HEALTH
# =====================================

Set-Location "C:\Users\ameli\struxora\struxora"

Write-Host "`n1) Checking port 3001..." -ForegroundColor Cyan
netstat -ano | findstr :3001

Write-Host "`n2) Starting API on PORT=3001 (in background job)..." -ForegroundColor Cyan
$env:PORT = "3001"
Start-Job -ScriptBlock {
  Set-Location "C:\Users\ameli\struxora\struxora"
  $env:PORT = "3001"
  pnpm --filter @struxora/api run start:dev
} | Out-Null

Write-Host "`nWaiting 5 seconds for API to boot..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

Write-Host "`n3) Testing health endpoint..." -ForegroundColor Cyan
try {
  Invoke-RestMethod -Uri "http://localhost:3001/health" -TimeoutSec 5
} catch {
  Write-Host "`nERROR: API not reachable. Check job output: Get-Job | Receive-Job" -ForegroundColor Red
}
