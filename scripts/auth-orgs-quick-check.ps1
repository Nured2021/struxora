# =========================================================
# STRUXORA – NEXT STEP (ALL-IN-ONE): AUTH + ORGS + QUICK CHECK
# =========================================================
# What this does:
# 1) Health check
# 2) Register admin user (ignores "already exists")
# 3) Login -> gets access token
# 4) /auth/me
# 5) (Optional) Create org if endpoint exists, then list orgs
#
# Run from any PowerShell: .\scripts\auth-orgs-quick-check.ps1
# =========================================================

$base  = "http://localhost:3001"
$email = "admin@test.com"
$pass  = "Admin123!"

Write-Host "`n[1] Health..." -ForegroundColor Cyan
Invoke-RestMethod -Uri "$base/health" -TimeoutSec 5 | ConvertTo-Json -Depth 10

Write-Host "`n[2] Register (best-effort; ok if already exists)..." -ForegroundColor Cyan
try {
  Invoke-RestMethod -Method POST -Uri "$base/auth/register" -ContentType "application/json" `
    -Body (@{ email=$email; password=$pass } | ConvertTo-Json) | ConvertTo-Json -Depth 10
} catch {
  Write-Host "Register skipped (user may already exist)." -ForegroundColor Yellow
}

Write-Host "`n[3] Login..." -ForegroundColor Cyan
$login = Invoke-RestMethod -Method POST -Uri "$base/auth/login" -ContentType "application/json" `
  -Body (@{ email=$email; password=$pass } | ConvertTo-Json)

$login | ConvertTo-Json -Depth 10
$token = $login.accessToken
if (-not $token) { $token = $login.AccessToken }
if (-not $token) { throw "No accessToken returned from login." }

Write-Host "`n[4] /auth/me ..." -ForegroundColor Cyan
Invoke-RestMethod -Method GET -Uri "$base/auth/me" -Headers @{ Authorization = "Bearer $token" } | ConvertTo-Json -Depth 10

Write-Host "`n[5] Orgs (optional)..." -ForegroundColor Cyan
# Try create org (ignore if route doesn't exist)
try {
  $org = Invoke-RestMethod -Method POST -Uri "$base/orgs" -ContentType "application/json" `
    -Headers @{ Authorization = "Bearer $token" } `
    -Body (@{ name="Demo Org"; slug="demo-org" } | ConvertTo-Json)
  Write-Host "Created org (or already exists):" -ForegroundColor Green
  $org | ConvertTo-Json -Depth 10
} catch {
  Write-Host "Create org skipped (route may not exist or requires different body)." -ForegroundColor Yellow
}

# List orgs (ignore if route doesn't exist)
try {
  $orgs = Invoke-RestMethod -Method GET -Uri "$base/orgs" -Headers @{ Authorization = "Bearer $token" }
  Write-Host "Orgs:" -ForegroundColor Green
  $orgs | ConvertTo-Json -Depth 10
} catch {
  Write-Host "List orgs skipped (route may not exist)." -ForegroundColor Yellow
}

Write-Host "`nDONE ✅  Next: tell me which AI feature endpoint you want first (JSA / FLHA / Incident / Toolbox Talk)." -ForegroundColor Green
