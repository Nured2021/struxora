# =====================================
# STRUXORA - FULL START + HEALTH TEST
# =====================================
# Run this script. The API runs in THIS window.
# To test health, open a SECOND PowerShell: Invoke-RestMethod http://localhost:3001/health

Set-Location "C:\Users\ameli\struxora\struxora"

Write-Host "`n1) Ensuring pnpm is available..." -ForegroundColor Cyan
if (-not (Get-Command pnpm -ErrorAction SilentlyContinue)) {
  Write-Host "pnpm not found. Attempting to add common npm path..." -ForegroundColor Yellow
  $npmGlobal = "$env:APPDATA\npm"
  if (Test-Path $npmGlobal) {
    $env:Path += ";$npmGlobal"
  }
}

if (-not (Get-Command pnpm -ErrorAction SilentlyContinue)) {
  Write-Host "ERROR: pnpm still not found. Install with: npm install -g pnpm" -ForegroundColor Red
  exit 1
}

Write-Host "`n2) Checking if port 3001 is in use..." -ForegroundColor Cyan
$existing = netstat -ano | findstr :3001
if ($existing) {
  Write-Host "Port 3001 appears in use:" -ForegroundColor Yellow
  $existing
}

Write-Host "`n3) Starting API on PORT=3001 (watch below for errors)..." -ForegroundColor Cyan
$env:PORT = "3001"
pnpm --filter @struxora/api run start:dev
