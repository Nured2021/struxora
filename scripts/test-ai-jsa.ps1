# =========================================
# STRUXORA – TEST POST /ai/jsa
# =========================================
# Run from repo root: .\scripts\test-ai-jsa.ps1
# Requires: API running on port 3001, admin@test.com / Admin123!
# =========================================

$base  = "http://localhost:3001"
$email = "admin@test.com"
$pass  = "Admin123!"

Write-Host "`n[1] Login..." -ForegroundColor Cyan
$login = Invoke-RestMethod -Method POST -Uri "$base/auth/login" -ContentType "application/json" `
  -Body (@{ email = $email; password = $pass } | ConvertTo-Json)
$token = $login.accessToken
if (-not $token) { $token = $login.AccessToken }
if (-not $token) { throw "No accessToken returned." }

Write-Host "`n[2] POST /ai/jsa..." -ForegroundColor Cyan
$body = @{
  task       = "Grinding and cutting metal brackets"
  location   = "Shop bay 2"
  tools      = @("Angle grinder", "Cut-off wheel")
  hazards    = @("sparks", "sharp edges")
  severity   = 4
  probability = 4
} | ConvertTo-Json

Invoke-RestMethod -Method POST -Uri "$base/ai/jsa" `
  -Headers @{ Authorization = "Bearer $token" } `
  -ContentType "application/json" -Body $body | ConvertTo-Json -Depth 10

Write-Host "`nDONE" -ForegroundColor Green
