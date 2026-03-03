# =========================================
# STRUXORA - FULL BUILD FIX (ONE RUN)
# =========================================

Set-Location "C:\Users\ameli\struxora\struxora"

Write-Host "`n1) Force TypeScript target to ES2018..." -ForegroundColor Cyan
Get-ChildItem -Path . -Recurse -Filter tsconfig*.json | Where-Object { $_.FullName -notlike "*node_modules*" } | ForEach-Object {
  (Get-Content $_.FullName -Raw) `
    -replace '"target"\s*:\s*"[^"]*"', '"target": "ES2018"' |
  Set-Content $_.FullName -NoNewline
}
Write-Host "TypeScript target updated." -ForegroundColor Green

Write-Host "`n2) Replacing Role enum with string in e2e test (safe temporary fix)..." -ForegroundColor Cyan
$testFile = "apps\api\test\auth.e2e-spec.ts"
if (Test-Path $testFile) {
  $content = Get-Content $testFile -Raw
  $content = $content -replace "import\s+\{\s*Role\s*\}\s+from\s+'@prisma/client';\r?\n", ""
  $content = $content -replace "Role\.WORKER", '"WORKER"'
  Set-Content $testFile -Value $content -NoNewline
  Write-Host "Role import and usages updated." -ForegroundColor Yellow
}

Write-Host "`n3) Clean Prisma client regeneration..." -ForegroundColor Cyan
pnpm --filter @struxora/api exec prisma generate

Write-Host "`n4) Clean reinstall dependencies..." -ForegroundColor Cyan
pnpm install

Write-Host "`n5) Start API on PORT=3001..." -ForegroundColor Cyan
$env:PORT = "3001"
pnpm --filter @struxora/api run start:dev
