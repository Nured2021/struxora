# =========================================
# STRUXORA – SWITCH TO SQLITE (NO DOCKER)
# =========================================
# Run from repo root: .\scripts\switch-to-sqlite.ps1
# =========================================

cd C:\Users\ameli\struxora\struxora

Write-Host "`n[1] Switching Prisma to SQLite..." -ForegroundColor Cyan

$schemaPath = "apps\api\prisma\schema.prisma"
if (-not (Test-Path $schemaPath)) {
    Write-Host "ERROR: schema.prisma not found." -ForegroundColor Red
    exit 1
}

$schema = Get-Content $schemaPath -Raw
# Only change the datasource block (don't touch generator client)
$schema = $schema -replace '(\bprovider\s*=\s*)"postgresql"', '${1}"sqlite"'
$schema = $schema -replace 'url\s*=\s*env\("DATABASE_URL"\)', 'url = "file:./dev.db"'
Set-Content $schemaPath $schema

Write-Host "Prisma schema switched to SQLite." -ForegroundColor Green

Write-Host "`n[2] Generate Prisma client..." -ForegroundColor Cyan
pnpm --filter @struxora/api exec prisma generate

Write-Host "`n[3] Push DB schema (creates dev.db)..." -ForegroundColor Cyan
pnpm --filter @struxora/api exec prisma db push

Write-Host "`n[4] Start API on PORT=3001..." -ForegroundColor Cyan
$env:PORT = "3001"
pnpm --filter @struxora/api run start:dev
