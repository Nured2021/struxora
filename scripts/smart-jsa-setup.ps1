# =========================================================
# STRUXORA – ADD OPENAI "SMART JSA" (SETUP REMINDER)
# =========================================================
# OpenAI Smart JSA is already wired in code. You only need:
# 1) Set OPENAI_API_KEY (once per machine or session)
# 2) Restart the API
#
# Set key permanently (then open a NEW PowerShell):
#   setx OPENAI_API_KEY "YOUR_KEY_HERE"
#
# Or for this session only:
#   $env:OPENAI_API_KEY = "YOUR_KEY_HERE"
# =========================================================

$repo = "C:\Users\ameli\struxora\struxora"
Set-Location $repo

if (-not $env:OPENAI_API_KEY) {
  Write-Host "`nWARN: OPENAI_API_KEY is not set in this PowerShell." -ForegroundColor Yellow
  Write-Host "Smart JSA will still work but will return rule-based only (ai.enabled: false)." -ForegroundColor Gray
  Write-Host "To enable OpenAI: setx OPENAI_API_KEY `"YOUR_KEY`" then open a NEW PowerShell." -ForegroundColor Cyan
} else {
  Write-Host "`nOPENAI_API_KEY is set. Smart JSA will use OpenAI when API runs." -ForegroundColor Green
}

if (-not $env:OPENAI_MODEL) { $env:OPENAI_MODEL = "gpt-4o-mini" }
Write-Host "Model (optional): OPENAI_MODEL = $env:OPENAI_MODEL" -ForegroundColor Gray

Write-Host "`nRestart API if it's running (Ctrl+C then start again)." -ForegroundColor Yellow
Write-Host "`nTest after restart:" -ForegroundColor Cyan
Write-Host @'
$base='http://localhost:3001'
$login = Invoke-RestMethod -Method POST -Uri "$base/auth/login" -ContentType "application/json" -Body '{"email":"admin@test.com","password":"Admin123!"}'
$token = $login.accessToken
Invoke-RestMethod -Method POST -Uri "$base/ai/jsa" -Headers @{ Authorization = "Bearer $token" } -ContentType "application/json" -Body '{
  "task":"Grinding and cutting metal brackets",
  "location":"Shop bay 2",
  "tools":["Angle grinder","Cut-off wheel"],
  "hazards":["sparks","sharp edges"],
  "severity":4,
  "probability":4
}' | ConvertTo-Json -Depth 12
'@
