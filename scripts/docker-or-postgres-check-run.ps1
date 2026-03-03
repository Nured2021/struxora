# =========================================
# STRUXORA – DOCKER OR POSTGRES CHECK + RUN
# =========================================
# Run from repo root: .\scripts\docker-or-postgres-check-run.ps1
# =========================================

cd C:\Users\ameli\struxora\struxora

Write-Host "`n[1] Checking Docker..." -ForegroundColor Cyan

$dockerOk = $false
try {
    docker version | Out-Null
    $dockerOk = $true
} catch {
    $dockerOk = $false
}

if ($dockerOk) {
    Write-Host "Docker is available." -ForegroundColor Green
    docker ps
    Write-Host "`n[2] Running full Postgres + migrate + API script..." -ForegroundColor Cyan
    .\scripts\start-postgres-migrate-run.ps1
    exit
}

Write-Host "Docker not available in this session." -ForegroundColor Yellow
Write-Host "`n[2] Checking if Postgres is already running on localhost:5432..." -ForegroundColor Cyan

$pg = Test-NetConnection localhost -Port 5432 -WarningAction SilentlyContinue

if ($pg.TcpTestSucceeded) {
    Write-Host "Postgres is already running on port 5432." -ForegroundColor Green
    Write-Host "`n[3] Running full Postgres + migrate + API script..." -ForegroundColor Cyan
    .\scripts\start-postgres-migrate-run.ps1
} else {
    Write-Host "`nERROR: Neither Docker nor Postgres is running." -ForegroundColor Red
    Write-Host "Start Docker Desktop OR start a local Postgres server on localhost:5432." -ForegroundColor Yellow
    Write-Host "Then run this block again." -ForegroundColor Yellow
}
