# ============================================================
# FIX documents.service.ts IMPORT CORRUPTION (RESTORE + CLEAN)
# ============================================================

$repo   = "C:\Users\ameli\struxora\struxora"
$apiDir = Join-Path $repo "apps\api"
$path   = Join-Path $apiDir "src\documents\documents.service.ts"

$bak = Get-ChildItem -Path $apiDir "src\documents\documents.service.ts.bak_fix_*" -ErrorAction SilentlyContinue |
  Sort-Object LastWriteTime -Descending |
  Select-Object -First 1

if (-not $bak) { throw "No bak_fix backup found. Look in: $apiDir\src\documents" }

Copy-Item $bak.FullName $path -Force
Write-Host "Restored from backup: $($bak.FullName)" -ForegroundColor Green

$s = Get-Content $path -Raw

$s = [regex]::Replace($s, "^\s*import\s+\{\s*Response\s*\}\s+from\s+['""]express['""];\s*\r?\n", "", "Multiline")
$s = [regex]::Replace($s, "^\s*import\s+\*\s+as\s+PDFDocument\s+from\s+['""]pdfkit['""];\s*\r?\n", "", "Multiline")

$lines = $s -split "`r?`n"
if ($lines.Count -lt 2) { throw "Unexpected file format (too short)." }

$firstImportIndex = ($lines | Select-String -Pattern "^\s*import\s" | Select-Object -First 1).LineNumber
if (-not $firstImportIndex) { throw "No import lines found in file." }

$i = $firstImportIndex - 1
$insert = @(
  "import { Response } from 'express';",
  "import * as PDFDocument from 'pdfkit';"
)

$newLines = @()
for ($idx=0; $idx -lt $lines.Count; $idx++) {
  $newLines += $lines[$idx]
  if ($idx -eq $i) { foreach ($ins in $insert) { $newLines += $ins } }
}

$s2 = ($newLines -join "`r`n")
Set-Content -Path $path -Value $s2 -Encoding UTF8

Write-Host "Clean imports re-added (no corruption)." -ForegroundColor Cyan
Write-Host "DONE." -ForegroundColor Green
