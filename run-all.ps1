# run-all.ps1 — Setup and run from repo root (Windows)
# Run: powershell -ExecutionPolicy Bypass -File .\run-all.ps1

$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot

Write-Host "=== Struxora run-all ===" -ForegroundColor Cyan

# 1. Start Postgres (skip if Docker not available)
Write-Host "`n[1/4] Starting Postgres..." -ForegroundColor Yellow
if (Get-Command docker -ErrorAction SilentlyContinue) {
    Push-Location infra
    docker compose up -d postgres
    Pop-Location
} else {
    Write-Host "Docker not found; skipping. Start Postgres manually if needed." -ForegroundColor Gray
}

# 2. Install dependencies
Write-Host "`n[2/4] Installing dependencies..." -ForegroundColor Yellow
pnpm install
if (-not $?) { Write-Error "pnpm install failed" }

# 3. Env + Prisma generate
if (-not (Test-Path "apps\api\.env")) {
    Write-Host "`n[3/4] Copying .env.example to apps\api\.env..." -ForegroundColor Yellow
    Copy-Item "apps\api\.env.example" "apps\api\.env"
} else {
    Write-Host "`n[3/4] apps\api\.env exists, skipping copy." -ForegroundColor Gray
}
Write-Host "Generating Prisma client..." -ForegroundColor Yellow
pnpm --filter @struxora/api run prisma:generate
if (-not $?) { Write-Error "prisma:generate failed" }

# 4. Run API
Write-Host "`n[4/4] Starting API (start:dev)..." -ForegroundColor Yellow
pnpm --filter @struxora/api run start:dev
