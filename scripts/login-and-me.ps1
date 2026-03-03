param(
  [string]$BaseUrl = "http://localhost:3000",
  [string]$Email   = "test@test.com",
  [string]$Password= "Test12345!"
)

function Fail($msg) {
  Write-Host "`nERROR: $msg" -ForegroundColor Red
  exit 1
}

Write-Host "=== STRUXORA AUTH CHECK ===" -ForegroundColor Cyan
Write-Host "BaseUrl: $BaseUrl"
Write-Host "Email:   $Email"
Write-Host ""

# 1) Quick connectivity / health check (optional but saves time)
Write-Host "=== HEALTH ===" -ForegroundColor Cyan
try {
  $health = Invoke-RestMethod -Method GET -Uri "$BaseUrl/health" -TimeoutSec 5
  $health | ConvertTo-Json -Depth 10
} catch {
  Fail "Can't reach API at $BaseUrl. Start the API or use the correct port. Error: $($_.Exception.Message)"
}

# 2) Login
Write-Host "`n=== LOGIN ===" -ForegroundColor Cyan
try {
  $login = Invoke-RestMethod `
    -Method POST `
    -Uri "$BaseUrl/auth/login" `
    -ContentType "application/json" `
    -Body (@{ email=$Email; password=$Password } | ConvertTo-Json)

  $login | ConvertTo-Json -Depth 10
} catch {
  Fail "Login failed. Error: $($_.Exception.Message)"
}

if (-not $login.accessToken) {
  Fail "Login response did not contain accessToken. Check API response structure."
}

# 3) /auth/me
Write-Host "`n=== /auth/me ===" -ForegroundColor Cyan
try {
  $me = Invoke-RestMethod `
    -Method GET `
    -Uri "$BaseUrl/auth/me" `
    -Headers @{ Authorization = "Bearer $($login.accessToken)" }

  $me | ConvertTo-Json -Depth 10
} catch {
  Fail "/auth/me failed. Error: $($_.Exception.Message)"
}

Write-Host "`nDone." -ForegroundColor Green
