# =====================================
# FIX PNPM (install + PATH) + VERIFY
# =====================================

Write-Host "1) Checking Node/NPM..." -ForegroundColor Cyan
node -v
npm -v

Write-Host "`n2) Installing pnpm globally..." -ForegroundColor Cyan
npm install -g pnpm

Write-Host "`n3) Refreshing PATH for this session..." -ForegroundColor Cyan
# Common npm global bin locations (Windows)
$pathsToAdd = @(
  "$env:APPDATA\npm",                      # most common (C:\Users\<you>\AppData\Roaming\npm)
  "$env:LOCALAPPDATA\Programs\nodejs",     # sometimes
  "C:\Program Files\nodejs"                # node folder
)

foreach ($p in $pathsToAdd) {
  if ((Test-Path $p) -and ($env:Path -notlike "*$p*")) {
    $env:Path += ";$p"
  }
}

Write-Host "`n4) Checking pnpm..." -ForegroundColor Cyan
where pnpm
pnpm -v
