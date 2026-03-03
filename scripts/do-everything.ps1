# ==========================================================
# STRUXORA "DO-EVERYTHING" QUICK FIX + RUN (CLEAN + STRONG)
# ==========================================================
# Runs from repo root. Fixes TS target, fixes Role enum usage in e2e test,
# regenerates Prisma client, installs deps, starts API on 3001,
# waits for port, tests /health, then runs auth-check.
#
# Usage:
#   1) Open PowerShell (Admin recommended, but not required)
#   2) Run: .\scripts\do-everything.ps1
# ==========================================================

$ErrorActionPreference = "Stop"

function Info($m) { Write-Host $m -ForegroundColor Cyan }
function Ok($m) { Write-Host $m -ForegroundColor Green }
function Warn($m) { Write-Host $m -ForegroundColor Yellow }
function Fail($m) { Write-Host "ERROR: $m" -ForegroundColor Red; exit 1 }

# ---- Config ----
$repo  = "C:\Users\ameli\struxora\struxora"
$port  = 3001
$base  = "http://localhost:$port"
$email = "admin@test.com"
$pass  = "Admin123!"

# ---- Go to repo ----
Info "`n[0] Go to repo"
if (-not (Test-Path $repo)) { Fail "Repo path not found: $repo" }
Set-Location $repo

# ---- Check Node + pnpm ----
Info "`n[1] Check Node + pnpm"
if (-not (Get-Command node -ErrorAction SilentlyContinue)) { Fail "node not found in PATH. Install Node LTS and reopen PowerShell." }
if (-not (Get-Command npm -ErrorAction SilentlyContinue)) { Fail "npm not found. Node install looks incomplete." }

if (-not (Get-Command pnpm -ErrorAction SilentlyContinue)) {
  Warn "pnpm not found. Installing pnpm globally..."
  npm install -g pnpm
  $npmBin = "$env:APPDATA\npm"
  if (Test-Path $npmBin) { $env:Path += ";$npmBin" }
}
if (-not (Get-Command pnpm -ErrorAction SilentlyContinue)) { Fail "pnpm still not found after install. Restart terminal, then try again." }
Ok ("node: " + (node -v))
Ok ("pnpm: " + (pnpm -v))

# ---- Fix TypeScript target (exclude node_modules) ----
Info "`n[2] Force TS target ES2018 (exclude node_modules)"
function Get-TsConfigs($dir) {
  Get-ChildItem -Path $dir -Filter "tsconfig*.json" -File -ErrorAction SilentlyContinue
  Get-ChildItem -Path $dir -Directory -ErrorAction SilentlyContinue |
    Where-Object { $_.Name -ne "node_modules" } |
    ForEach-Object { Get-TsConfigs $_.FullName }
}
Get-TsConfigs (Get-Location) | ForEach-Object {
    $p = $_.FullName
    $raw = Get-Content $p -Raw
    if ($raw -match '"target"\s*:') {
      $raw = [regex]::Replace($raw, '"target"\s*:\s*"[^"]*"', '"target": "ES2018"')
    } elseif ($raw -match '"compilerOptions"\s*:\s*\{') {
      $raw = [regex]::Replace($raw, '("compilerOptions"\s*:\s*\{)', '$1' + "`r`n    `"target`": `"ES2018`",")
    } else {
      $raw = $raw.TrimEnd() + "`r`n{`r`n  `"compilerOptions`": { `"target`": `"ES2018`" }`r`n}`r`n"
    }
    Set-Content -Path $p -Value $raw -Encoding UTF8
  }
Ok "TS configs updated."

# ---- Fix broken Role usage in e2e test (safe temporary fix) ----
Info "`n[3] Fix Prisma Role import/usage in e2e test (safe temp fix)"
$testFile = "apps\api\test\auth.e2e-spec.ts"
if (Test-Path $testFile) {
  $t = Get-Content $testFile -Raw
  $t = [regex]::Replace($t, "^\s*import\s+\{\s*Role\s*\}\s+from\s+'@prisma/client';\s*`r?`n", "", "Multiline")
  $t = [regex]::Replace($t, "Role\.([A-Z_]+)", '"$1"')
  Set-Content -Path $testFile -Value $t -Encoding UTF8
  Ok "E2E Role import/usage patched."
} else {
  Warn "Test file not found: $testFile (skipping)"
}

# ---- Prisma generate ----
Info "`n[4] Prisma generate"
try {
  pnpm --filter @struxora/api exec prisma generate
  Ok "Prisma client generated."
} catch {
  Warn "Prisma generate failed. If this is due to missing schema/env, fix that next."
  throw
}

# ---- Install deps ----
Info "`n[5] Install deps"
pnpm install
Ok "Dependencies installed."

# ---- Ensure .env exists (dev defaults) ----
Info "`n[5b] Ensure .env exists"
$envPath = Join-Path $repo ".env"
$envExample = Join-Path $repo "apps\api\.env.example"
if (-not (Test-Path $envPath)) {
  if (Test-Path $envExample) {
    $content = Get-Content $envExample -Raw
    $content = $content -replace 'JWT_ACCESS_SECRET=.*', 'JWT_ACCESS_SECRET=dev-access-secret-min-32-characters-long'
    $content = $content -replace 'JWT_REFRESH_SECRET=.*', 'JWT_REFRESH_SECRET=dev-refresh-secret-min-32-characters-long'
    $content = $content -replace 'PORT=.*', "PORT=$port"
    Set-Content -Path $envPath -Value $content -Encoding UTF8
    Ok "Created .env from example (dev secrets)."
  } else {
    Warn ".env missing and no .env.example found. Create .env with DATABASE_URL and JWT_ACCESS_SECRET."
  }
} else {
  Ok ".env present."
}

# ---- Start Postgres (Docker) if available ----
Info "`n[5c] Start Postgres (Docker, if available)"
$composePath = Join-Path $repo "infra\docker-compose.yml"
if ((Get-Command docker -ErrorAction SilentlyContinue) -and (Test-Path $composePath)) {
  Set-Location (Split-Path $composePath)
  docker compose up -d postgres 2>$null
  Set-Location $repo
  $pgDeadline = (Get-Date).AddSeconds(30)
  while ((Get-Date) -lt $pgDeadline) {
    try {
      $null = docker exec struxora-postgres pg_isready -U struxora -d struxora 2>$null
      if ($LASTEXITCODE -eq 0) { break }
    } catch {}
    Start-Sleep -Seconds 2
  }
  try {
    $null = docker exec struxora-postgres pg_isready -U struxora -d struxora 2>$null
    if ($LASTEXITCODE -eq 0) { Ok "Postgres is ready." } else { Warn "Postgres may not be ready yet." }
  } catch { Warn "Could not verify Postgres." }
} else {
  Warn "Docker or infra/docker-compose.yml not found. Ensure Postgres is running on localhost:5432."
}

# ---- Run migrations ----
Info "`n[5d] Prisma migrate"
try {
  pnpm --filter @struxora/api exec prisma migrate deploy
  Ok "Migrations applied."
} catch {
  Warn "Prisma migrate failed (DB may be down or no migrations). Try: pnpm --filter @struxora/api exec prisma migrate deploy"
}

# ---- Start API in a new window and wait for port ----
Info "`n[6] Start API on PORT=$port (new window) + wait for LISTENING"
Start-Process powershell -ArgumentList @(
  "-NoExit",
  "-Command",
  "cd `"$repo`"; `$env:PORT='$port'; pnpm --filter @struxora/api run start:dev"
) | Out-Null

$deadline = (Get-Date).AddSeconds(120)
do {
  $listening = netstat -ano | findstr ":$port" | findstr "LISTENING"
  if ($listening) { break }
  Start-Sleep -Seconds 2
} while ((Get-Date) -lt $deadline)

if (-not $listening) {
  Fail "Port $port never started listening. Check the NEW API window output for the real error."
}
Ok "Port $port is listening."

# ---- Health check ----
Info "`n[7] Health check"
try {
  $health = Invoke-RestMethod -Uri "$base/health" -TimeoutSec 5
  $health | ConvertTo-Json -Depth 10
  Ok "/health OK"
} catch {
  Warn "Port is listening but /health failed. Try /api/health or check route config."
  Warn $_.Exception.Message
}

# ---- Register (best-effort; ignore conflict) ----
Info "`n[8] Register user (best-effort; ignores conflicts)"
try {
  Invoke-RestMethod -Method POST -Uri "$base/auth/register" -ContentType "application/json" `
    -Body (@{ email = $email; password = $pass } | ConvertTo-Json) | Out-Null
  Ok "Registered $email"
} catch {
  Warn "Register may have failed because user already exists (often 409). Continuing..."
}

# ---- Auth check (login + /auth/me) ----
Info "`n[9] Run auth-check"
if (Test-Path ".\scripts\auth-check.ps1") {
  .\scripts\auth-check.ps1 -BaseUrl $base -Email $email -Password $pass
  Ok "Auth check completed."
} else {
  Warn "scripts/auth-check.ps1 not found. Run manually if needed."
  Warn "Login: POST $base/auth/login, then GET $base/auth/me with Bearer token"
}

Ok "`nDONE. If anything failed, copy the NEW API window error output (last ~30 lines)."
