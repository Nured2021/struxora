# =========================================
# STRUXORA – FINAL DB CHECK + RUN
# =========================================
# Run from repo root: .\scripts\final-db-check-run.ps1
# =========================================

cd C:\Users\ameli\struxora\struxora

Write-Host "`n[1] Checking Docker..." -ForegroundColor Cyan
$dockerOk = $false
try { docker version | Out-Null; $dockerOk = $true } catch {}

if ($dockerOk) {
    Write-Host "Docker available. Starting full script..." -ForegroundColor Green
    .\scripts\start-postgres-migrate-run.ps1
    exit
}

Write-Host "Docker not available." -ForegroundColor Yellow

Write-Host "`n[2] Checking Postgres on localhost:5432..." -ForegroundColor Cyan
$pg = Test-NetConnection localhost -Port 5432 -WarningAction SilentlyContinue

if ($pg.TcpTestSucceeded) {
    Write-Host "Postgres is running. Continuing..." -ForegroundColor Green
    .\scripts\start-postgres-migrate-run.ps1
} else {
    Write-Host "`nERROR: No Docker and no Postgres running." -ForegroundColor Red
    Write-Host "Start Docker Desktop OR start Postgres locally." -ForegroundColor Yellow
    Write-Host "Then run this block again." -ForegroundColor Yellow
}
