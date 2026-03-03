# =========================================
# STRUXORA – ORG + MEMBERSHIP (NO DUP SLUG) QUICK VERIFY
# =========================================
# Run from repo root: .\scripts\org-membership-quick-verify.ps1
# =========================================

$base  = "http://localhost:3001"
$email = "admin@test.com"
$pass  = "Admin123!"

# Login
$login = Invoke-RestMethod -Method POST -Uri "$base/auth/login" -ContentType "application/json" `
  -Body (@{ email=$email; password=$pass } | ConvertTo-Json)
$token = $login.accessToken
if (-not $token) { $token = $login.AccessToken }
if (-not $token) { throw "No accessToken returned from login." }

# Create org with random slug (avoids duplicates)
$slug = "demo-org-$((Get-Random -Minimum 1000 -Maximum 9999))"
$body = @{ name = "Demo Org"; slug = $slug } | ConvertTo-Json

Write-Host "`nCreating org with slug: $slug" -ForegroundColor Cyan
$org = Invoke-RestMethod -Method POST -Uri "$base/orgs" `
  -Headers @{ Authorization = "Bearer $token" } `
  -ContentType "application/json" -Body $body
$org | ConvertTo-Json -Depth 10

Write-Host "`n/auth/me (should include ORG_OWNER membership)..." -ForegroundColor Cyan
Invoke-RestMethod -Method GET -Uri "$base/auth/me" -Headers @{ Authorization = "Bearer $token" } | ConvertTo-Json -Depth 10

Write-Host "`nDONE ✅ Next: build first AI feature endpoint: JSA (recommended)" -ForegroundColor Green
