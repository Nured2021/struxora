# ============================================================
# NEXT STEP — RUN LOCALLY + CAPTURE FULL LOG (PowerShell)
# ============================================================
# 0) Open a NEW Windows PowerShell (not Cursor)
# 1) Set env vars for this session (avoid Read-Host hang)
# 2) Run this script — output is shown AND saved to smart-jsa-run.log
#
# Usage:
#   $env:OPENAI_API_KEY="sk-your-real-key"
#   $env:OPENAI_MODEL="gpt-4o-mini"
#   cd C:\Users\ameli\struxora\struxora
#   .\scripts\run-smart-jsa-with-log.ps1
# ============================================================

$ErrorActionPreference = "Stop"
$repo = "C:\Users\ameli\struxora\struxora"
Set-Location $repo

$logPath = Join-Path $repo "smart-jsa-run.log"
Write-Host "Log will be written to: $logPath" -ForegroundColor Gray

.\scripts\smart-jsa-hardened-test.ps1 *>&1 | Tee-Object -FilePath $logPath

Write-Host "`n--- Quick checks ---" -ForegroundColor Cyan
try { Invoke-RestMethod http://localhost:3001/health | ConvertTo-Json } catch { Write-Host "Health failed: $_" -ForegroundColor Yellow }
netstat -ano 2>$null | findstr ":3001"
