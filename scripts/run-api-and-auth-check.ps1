# =========================
# STRUXORA - RUN API ON 3001 + WAIT + TEST AUTH (ALL-IN-ONE)
# Run from: C:\Users\ameli\struxora\struxora
# =========================

Set-Location "C:\Users\ameli\struxora\struxora"

$base  = "http://localhost:3001"
$port  = 3001
$email = "admin@test.com"
$pass  = "Admin123!"

function Is-PortListening([int]$p) {
  $out = netstat -ano | findstr ":$p" | findstr "LISTENING"
  return [bool]$out
}

function Fail($msg) {
  Write-Host "`nERROR: $msg" -ForegroundColor Red
  exit 1
}

Write-Host "1) Checking if port $port is listening..." -ForegroundColor Cyan
if (-not (Is-PortListening $port)) {
  Write-Host "   Nothing listening on $port. Starting API in a NEW window with PORT=$port..." -ForegroundColor Yellow

  Start-Process powershell -ArgumentList @(
    '-NoExit',
    '-Command',
    "cd 'C:\Users\ameli\struxora\struxora'; `$env:PORT='$port'; pnpm --filter @struxora/api run start:dev"
  )

  Write-Host "   Waiting for port $port to start listening (up to 90 seconds)..." -ForegroundColor Yellow

  $deadline = (Get-Date).AddSeconds(90)
  while ((Get-Date) -lt $deadline) {
    if (Is-PortListening $port) { break }
    Start-Sleep -Seconds 2
  }

  if (-not (Is-PortListening $port)) {
    Fail "Port $port never started listening. The API likely failed to start. Check the NEW API window for errors."
  }

  Write-Host "   Port $port is now listening." -ForegroundColor Green
} else {
  Write-Host "   Port $port is already listening." -ForegroundColor Green
}

Write-Host "`n2) Health check..." -ForegroundColor Cyan
try {
  Invoke-RestMethod -Method GET -Uri "$base/health" -TimeoutSec 8 | ConvertTo-Json -Depth 10
} catch {
  Fail "Port is listening, but /health failed. Either /health route doesn't exist or API is on a different base path. Error: $($_.Exception.Message)"
}

Write-Host "`n3) Register user (ok if it already exists)..." -ForegroundColor Cyan
try {
  Invoke-RestMethod -Method POST -Uri "$base/auth/register" -ContentType "application/json" `
    -Body (@{ email=$email; password=$pass } | ConvertTo-Json) | ConvertTo-Json -Depth 10
} catch {
  Write-Host "   Register failed (often 409 if user already exists). Continuing..." -ForegroundColor Yellow
}

Write-Host "`n4) Run auth check..." -ForegroundColor Cyan
.\scripts\auth-check.ps1 -BaseUrl $base -Email $email -Password $pass
