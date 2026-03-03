# =========================================
# STRUXORA MVP DEMO – ONE BLOCK E2E
# =========================================
# Run from repo root: .\scripts\mvp-demo-e2e.ps1
# Requires: API on port 3001
# =========================================

$base  = "http://localhost:3001"
$email = "admin@test.com"
$pass  = "Admin123!"

# Health
Write-Host "`n[1] Health" -ForegroundColor Cyan
Invoke-RestMethod "$base/health" | ConvertTo-Json

# Login
Write-Host "`n[2] Login" -ForegroundColor Cyan
$login = Invoke-RestMethod -Method POST -Uri "$base/auth/login" -ContentType "application/json" `
  -Body (@{ email=$email; password=$pass } | ConvertTo-Json)
$token = $login.accessToken
if (-not $token) { $token = $login.AccessToken }
if (-not $token) { throw "No accessToken returned." }

# Ensure we have an org (create random)
Write-Host "`n[3] Ensure Org" -ForegroundColor Cyan
$slug = "demo-org-$((Get-Random -Minimum 1000 -Maximum 9999))"
$org = Invoke-RestMethod -Method POST -Uri "$base/orgs" -Headers @{Authorization="Bearer $token"} `
  -ContentType "application/json" -Body (@{ name="Demo Org"; slug=$slug } | ConvertTo-Json)

# Get orgId from /auth/me (membership)
$me = Invoke-RestMethod -Method GET -Uri "$base/auth/me" -Headers @{Authorization="Bearer $token"}
$orgId = $me.memberships[0].organizationId
if (-not $orgId) { throw "No organizationId found in memberships. Create org first." }
Write-Host "Using orgId: $orgId" -ForegroundColor Green

# Create + Save JSA Document
Write-Host "`n[4] Create+Save JSA Document" -ForegroundColor Cyan
$doc = Invoke-RestMethod -Method POST -Uri "$base/documents/jsa" -Headers @{Authorization="Bearer $token"} `
  -ContentType "application/json" -Body (@{
    orgId       = $orgId
    task        = "Grinding and cutting metal brackets"
    location    = "Shop bay 2"
    tools       = @("Angle grinder","Cut-off wheel")
    hazards     = @("sparks","sharp edges")
    severity    = 4
    probability = 4
  } | ConvertTo-Json)

$docId = $doc.id
Write-Host "Created docId: $docId" -ForegroundColor Green

# List
Write-Host "`n[5] List JSA Documents" -ForegroundColor Cyan
$list = Invoke-RestMethod -Method GET -Uri "$base/documents/jsa?orgId=$orgId" -Headers @{Authorization="Bearer $token"}
$list | ConvertTo-Json -Depth 6

# Detail
Write-Host "`n[6] Get JSA Document Detail" -ForegroundColor Cyan
$detail = Invoke-RestMethod -Method GET -Uri "$base/documents/jsa/$docId" -Headers @{Authorization="Bearer $token"}
$detail | ConvertTo-Json -Depth 10

Write-Host "`nDONE ✅ MVP Flow Works: Auth → Org → Create JSA → Save → History → Detail" -ForegroundColor Green
