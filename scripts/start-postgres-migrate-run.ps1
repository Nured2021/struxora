# =========================================
# STRUXORA – NEXT STEP: START POSTGRES + MIGRATE + RUN API + VERIFY
# =========================================
# Requires: Docker in PATH (for Postgres), or Postgres already on localhost:5432.
# Run from repo root: .\scripts\start-postgres-migrate-run.ps1
# =========================================

$ErrorActionPreference = "Stop"
cd C:\Users\ameli\struxora\struxora

Write-Host "`n[1] Check Docker..." -ForegroundColor Cyan
$dockerOk = $false
try { docker version 2>$null | Out-Null; $dockerOk = $true } catch { $dockerOk = $false }

if ($dockerOk) {
  Write-Host "[2] Starting Postgres (docker compose)..." -ForegroundColor Cyan

  # Try the common infra path you mentioned
  if (Test-Path "infra\docker-compose.yml") {
    docker compose -f infra\docker-compose.yml up -d postgres
  } elseif (Test-Path "docker-compose.yml") {
    docker compose -f docker-compose.yml up -d postgres
  } else {
    Write-Host "WARN: Could not find docker-compose.yml. Start your Postgres manually, then continue." -ForegroundColor Yellow
  }

  Write-Host "`n[3] Waiting for Postgres on localhost:5432..." -ForegroundColor Cyan
  $deadline = (Get-Date).AddSeconds(90)
  $tcp = $null
  do {
    try {
      $tcp = Test-NetConnection -ComputerName "localhost" -Port 5432 -WarningAction SilentlyContinue
      if ($tcp.TcpTestSucceeded) { break }
    } catch {}
    Start-Sleep -Seconds 2
  } while ((Get-Date) -lt $deadline)

  if (-not $tcp -or -not $tcp.TcpTestSucceeded) {
    Write-Host "ERROR: Postgres not reachable on 5432. Check docker logs or your DB settings." -ForegroundColor Red
    Write-Host "Try: docker ps  |  docker logs <postgres-container>" -ForegroundColor Yellow
    exit 1
  }

  Write-Host "OK: Postgres port is open." -ForegroundColor Green
} else {
  Write-Host "WARN: Docker not available. Checking if Postgres is already running on localhost:5432..." -ForegroundColor Yellow
  try {
    $tcp = Test-NetConnection -ComputerName "localhost" -Port 5432 -WarningAction SilentlyContinue
    if (-not $tcp.TcpTestSucceeded) {
      Write-Host "ERROR: Postgres is not reachable on localhost:5432. Start Postgres (e.g. start Docker Desktop and run this script again, or run postgres locally), then re-run this script." -ForegroundColor Red
      exit 1
    }
    Write-Host "OK: Postgres port is open." -ForegroundColor Green
  } catch {
    Write-Host "ERROR: Could not check port 5432. Start Postgres first, then re-run this script." -ForegroundColor Red
    exit 1
  }
}

Write-Host "`n[4] Apply Prisma migrations..." -ForegroundColor Cyan
& pnpm --filter @struxora/api exec prisma migrate deploy
if ($LASTEXITCODE -ne 0) {
  Write-Host "ERROR: Prisma migrate failed. Fix the error above and re-run." -ForegroundColor Red
  exit 1
}

Write-Host "`n[5] Run the full automation script (starts API + health + auth)..." -ForegroundColor Cyan
.\scripts\do-everything.ps1

Write-Host "`n[6] Final verify (run in this same window)..." -ForegroundColor Cyan
try {
  Invoke-RestMethod -Uri "http://localhost:3001/health" -TimeoutSec 5 | ConvertTo-Json -Depth 10
  Write-Host "Health OK." -ForegroundColor Green
} catch {
  Write-Host "WARN: Health check failed: $($_.Exception.Message)" -ForegroundColor Yellow
}
.\scripts\auth-check.ps1 -BaseUrl "http://localhost:3001" -Email "admin@test.com" -Password "Admin123!"
