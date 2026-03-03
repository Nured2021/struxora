# =========================================
# START API (NEW WINDOW) + WAIT FOR PORT + HEALTH
# =========================================

Set-Location "C:\Users\ameli\struxora\struxora"
$port = 3001
$base = "http://localhost:$port"

Write-Host "`n1) Starting API in a new PowerShell window on PORT=$port..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList @(
  "-NoExit",
  "-Command",
  "cd C:\Users\ameli\struxora\struxora; `$env:PORT='$port'; pnpm --filter @struxora/api run start:dev"
)

Write-Host "`n2) Waiting up to 90 seconds for port $port to start listening..." -ForegroundColor Yellow
$deadline = (Get-Date).AddSeconds(90)
do {
  $listening = netstat -ano | findstr ":$port" | findstr "LISTENING"
  if ($listening) { break }
  Start-Sleep -Seconds 2
} while ((Get-Date) -lt $deadline)

if (-not $listening) {
  Write-Host "`nERROR: Port $port never started listening. Check the new API window for the crash/error logs." -ForegroundColor Red
  exit 1
}

Write-Host "`n3) Port is listening. Testing /health..." -ForegroundColor Green
try {
  Invoke-RestMethod -Uri "$base/health" -TimeoutSec 5 | ConvertTo-Json -Depth 10
} catch {
  Write-Host "`nERROR: Port is listening but /health failed. Maybe the route is different (e.g. /api/health) or the app crashed after binding." -ForegroundColor Red
  Write-Host $_.Exception.Message
  exit 1
}

Write-Host "`nDONE: API is up and /health responded." -ForegroundColor Green
