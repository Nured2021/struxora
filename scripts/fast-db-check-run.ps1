# =====================================
# STRUXORA – FAST DB CHECK + RUN
# =====================================
# Run from repo root: .\scripts\fast-db-check-run.ps1
# =====================================

cd C:\Users\ameli\struxora\struxora

Write-Host "`nChecking Docker..." -ForegroundColor Cyan
$dockerOk = $false
try { docker version | Out-Null; $dockerOk = $true } catch {}

if ($dockerOk) {
    Write-Host "Docker is running." -ForegroundColor Green
} else {
    Write-Host "Docker NOT running." -ForegroundColor Yellow
}

Write-Host "`nChecking Postgres on localhost:5432..." -ForegroundColor Cyan
$pg = Test-NetConnection localhost -Port 5432 -WarningAction SilentlyContinue

if ($pg.TcpTestSucceeded) {
    Write-Host "Postgres is running." -ForegroundColor Green
} else {
    Write-Host "Postgres NOT running." -ForegroundColor Yellow
}

if (-not $dockerOk -and -not $pg.TcpTestSucceeded) {
    Write-Host "`nERROR: You must start Docker Desktop OR start Postgres locally." -ForegroundColor Red
    exit
}

Write-Host "`nRunning full database + API script..." -ForegroundColor Cyan
.\scripts\final-db-check-run.ps1
