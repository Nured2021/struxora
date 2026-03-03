# =====================================
# FIX NODE PATH + SETUP STRUXORA
# =====================================
# Note: Adding to Machine PATH requires running PowerShell as Administrator.

Write-Host "Checking Node installation folder..." -ForegroundColor Cyan

$nodePath = "C:\Program Files\nodejs"

if (Test-Path $nodePath) {
  Write-Host "Node folder found at $nodePath" -ForegroundColor Green
} else {
  Write-Host "Node folder NOT found. Node may not be installed correctly." -ForegroundColor Red
  exit 1
}

Write-Host "`nAdding Node to PATH (System level)..." -ForegroundColor Cyan

$currentPath = [Environment]::GetEnvironmentVariable("Path", "Machine")

if ($currentPath -notlike "*$nodePath*") {
  try {
    [Environment]::SetEnvironmentVariable(
      "Path",
      "$currentPath;$nodePath",
      "Machine"
    )
    Write-Host "Node added to system PATH." -ForegroundColor Green
  } catch {
    Write-Host "Failed to set Machine PATH (run as Administrator?). Adding to session only." -ForegroundColor Yellow
  }
} else {
  Write-Host "Node already in PATH." -ForegroundColor Yellow
}

# Refresh PATH for current session
$env:Path += ";$nodePath"

Write-Host "`nTesting Node..." -ForegroundColor Cyan
node -v
npm -v

if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
  Write-Host "`nNode still not recognized. Restart terminal or computer and try again." -ForegroundColor Red
  exit 1
}

Write-Host "`nInstalling pnpm..." -ForegroundColor Cyan
npm install -g pnpm

# Add npm global bin to session PATH (where pnpm is installed on Windows)
$npmBin = "$env:APPDATA\npm"
if (Test-Path $npmBin) {
  $env:Path += ";$npmBin"
}

Write-Host "`nTesting pnpm..." -ForegroundColor Cyan
pnpm -v

Write-Host "`nGoing to project directory..." -ForegroundColor Cyan
Set-Location "C:\Users\ameli\struxora\struxora"

Write-Host "`nInstalling project dependencies..." -ForegroundColor Cyan
pnpm install

Write-Host "`nStarting API on PORT=3001..." -ForegroundColor Cyan
$npmBin = "$env:APPDATA\npm"
Start-Process powershell -ArgumentList @(
  '-NoExit',
  '-Command',
  "`$env:Path += ';$npmBin'; cd 'C:\Users\ameli\struxora\struxora'; `$env:PORT='3001'; pnpm --filter @struxora/api run start:dev"
)

Write-Host "`nWaiting 10 seconds for API to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

Write-Host "`nTesting health endpoint..." -ForegroundColor Cyan
try {
  Invoke-RestMethod -Uri "http://localhost:3001/health" -TimeoutSec 5
} catch {
  Write-Host "Health check failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`nRunning auth check..." -ForegroundColor Cyan
.\scripts\run-api-and-auth-check.ps1
