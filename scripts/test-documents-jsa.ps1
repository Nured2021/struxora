# =========================================
# STRUXORA – TEST JSA DOCUMENTS (SAVE + HISTORY + DETAIL)
# =========================================
# Run from repo root: .\scripts\test-documents-jsa.ps1
# Requires: API on 3001, admin@test.com with at least one org
# =========================================

$base  = "http://localhost:3001"
$email = "admin@test.com"
$pass  = "Admin123!"

Write-Host "`n[1] Login..." -ForegroundColor Cyan
$login = Invoke-RestMethod -Method POST -Uri "$base/auth/login" -ContentType "application/json" `
  -Body (@{ email = $email; password = $pass } | ConvertTo-Json)
$token = $login.accessToken
if (-not $token) { $token = $login.AccessToken }
if (-not $token) { throw "No accessToken." }

Write-Host "`n[2] Get orgId from /auth/me..." -ForegroundColor Cyan
$me = Invoke-RestMethod -Method GET -Uri "$base/auth/me" -Headers @{ Authorization = "Bearer $token" }
$orgId = $me.memberships[0].organizationId
if (-not $orgId) { throw "User has no org. Create an org first (e.g. .\scripts\org-membership-quick-verify.ps1)." }
Write-Host "Using orgId: $orgId" -ForegroundColor Gray

Write-Host "`n[3] POST /documents/jsa (create + save)..." -ForegroundColor Cyan
$body = @{
  orgId       = $orgId
  task        = "Grinding and cutting metal brackets"
  location    = "Shop bay 2"
  tools       = @("Angle grinder", "Cut-off wheel")
  hazards     = @("sparks", "sharp edges")
  severity    = 4
  probability = 4
} | ConvertTo-Json

$created = Invoke-RestMethod -Method POST -Uri "$base/documents/jsa" `
  -Headers @{ Authorization = "Bearer $token" } `
  -ContentType "application/json" -Body $body

Write-Host "Created document id: $($created.id)" -ForegroundColor Green
$created | ConvertTo-Json -Depth 6

Write-Host "`n[4] GET /documents/jsa (list)..." -ForegroundColor Cyan
$list = Invoke-RestMethod -Method GET -Uri "$base/documents/jsa" -Headers @{ Authorization = "Bearer $token" }
$list | ConvertTo-Json -Depth 4

Write-Host "`n[5] GET /documents/jsa/$($created.id) (detail)..." -ForegroundColor Cyan
$detail = Invoke-RestMethod -Method GET -Uri "$base/documents/jsa/$($created.id)" -Headers @{ Authorization = "Bearer $token" }
$detail | ConvertTo-Json -Depth 8

Write-Host "`nDONE  Create JSA -> saved -> history -> open document." -ForegroundColor Green
