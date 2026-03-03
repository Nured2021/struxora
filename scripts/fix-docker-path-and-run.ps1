# =====================================
# FIX DOCKER PATH (FAST) + RUN SCRIPT
# =====================================
# Run from repo root: .\scripts\fix-docker-path-and-run.ps1
# =====================================

cd C:\Users\ameli\struxora\struxora

# 1) Add Docker CLI to PATH for THIS session (common install path)
$dockerBin = "C:\Program Files\Docker\Docker\resources\bin"
if (Test-Path $dockerBin) {
  $env:Path += ";$dockerBin"
  Write-Host "Added Docker bin to PATH for this session: $dockerBin" -ForegroundColor Green
} else {
  Write-Host "Docker bin not found at: $dockerBin" -ForegroundColor Yellow
  Write-Host "Open Docker Desktop and ensure it is installed, then re-run this block." -ForegroundColor Yellow
  exit 1
}

# 2) Verify docker is now found
Write-Host "`nVerifying docker..." -ForegroundColor Cyan
where docker
docker version

# 3) Run your DB + migrate + API script
Write-Host "`nRunning final DB check + run..." -ForegroundColor Cyan
.\scripts\final-db-check-run.ps1
