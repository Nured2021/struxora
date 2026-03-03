# =========================================
# STRUXORA – FINAL DATABASE + API START
# =========================================
# Run from repo root: .\scripts\final-database-api-start.ps1
# =========================================

cd C:\Users\ameli\struxora\struxora

Write-Host "`n[1] Checking Docker..." -ForegroundColor Cyan
$dockerOk = $false
try { docker version | Out-Null; $dockerOk = $true } catch {}

if ($dockerOk) {
    Write-Host "Docker is available." -ForegroundColor Green

    if (Test-Path "infra\docker-compose.yml") {
        docker compose -f infra\docker-compose.yml up -d postgres
    } elseif (Test-Path "docker-compose.yml") {
        docker compose up -d postgres
    }

    Write-Host "`nWaiting for Postgres on localhost:5432..." -ForegroundColor Yellow
    $deadline = (Get-Date).AddSeconds(90)
    do {
        $pg = Test-NetConnection localhost -Port 5432 -WarningAction SilentlyContinue
        if ($pg.TcpTestSucceeded) { break }
        Start-Sleep -Seconds 2
    } while ((Get-Date) -lt $deadline)

    if (-not $pg.TcpTestSucceeded) {
        Write-Host "ERROR: Postgres did not start." -ForegroundColor Red
        exit 1
    }

} else {
    Write-Host "Docker not available." -ForegroundColor Yellow
    $pg = Test-NetConnection localhost -Port 5432 -WarningAction SilentlyContinue
    if (-not $pg.TcpTestSucceeded) {
        Write-Host "`nERROR: No Docker and no Postgres running." -ForegroundColor Red
        Write-Host "Start Docker Desktop OR start local Postgres on port 5432." -ForegroundColor Yellow
        exit 1
    }
}

Write-Host "`n[2] Running Prisma migrations..." -ForegroundColor Cyan
pnpm --filter @struxora/api exec prisma migrate deploy

Write-Host "`n[3] Starting API on PORT=3001..." -ForegroundColor Cyan
$env:PORT="3001"
Start-Process powershell -ArgumentList '-NoExit','-Command','cd C:\Users\ameli\struxora\struxora; $env:PORT="3001"; pnpm --filter @struxora/api run start:dev'

Write-Host "`nWaiting for API..." -ForegroundColor Yellow
Start-Sleep -Seconds 8

Write-Host "`n[4] Testing health..." -ForegroundColor Cyan
Invoke-RestMethod http://localhost:3001/health

Write-Host "`nDONE: Database + API should now be running." -ForegroundColor Green
