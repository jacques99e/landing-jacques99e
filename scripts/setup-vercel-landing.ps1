# Configure Vercel Production env for Landing (SEO + liens app).
# Usage: powershell -ExecutionPolicy Bypass -File scripts/setup-vercel-landing.ps1
# Pour GSC : ajoutez NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION dans Landing/.env.local puis relancez.

$ErrorActionPreference = "Stop"
Set-Location (Join-Path $PSScriptRoot "..")

function Read-DotEnvValue([string]$filePath, [string]$key) {
  if (-not (Test-Path $filePath)) { return "" }
  $line = Get-Content $filePath | Where-Object { $_ -match "^$key=" } | Select-Object -First 1
  if (-not $line) { return "" }
  return ($line -replace "^$key=", "").Trim().Trim('"').Trim("'")
}

function Set-VercelEnv([string]$name, [string]$value) {
  if ([string]::IsNullOrWhiteSpace($value)) {
    Write-Host "[skip] $name (vide)"
    return
  }
  Write-Host "[set] $name"
  vercel env rm $name production --yes 2>$null | Out-Null
  $tmp = New-TemporaryFile
  try {
    Set-Content -Path $tmp -Value $value -NoNewline -Encoding utf8
    Get-Content $tmp -Raw | vercel env add $name production
    if ($LASTEXITCODE -ne 0) { throw "vercel env add failed for $name" }
  } finally {
    Remove-Item $tmp -Force -ErrorAction SilentlyContinue
  }
}

$localEnv = Join-Path $PWD ".env.local"
$wazoEnv = Join-Path (Split-Path $PWD -Parent) "wazo-digital\.env.local"

function Get-EnvValue([string]$key) {
  $v = Read-DotEnvValue $localEnv $key
  if ($v) { return $v }
  return Read-DotEnvValue $wazoEnv $key
}

Write-Host "=== Landing - setup Vercel Production ===" -ForegroundColor Cyan

$map = @{
  "NEXT_PUBLIC_APP_URL"                    = if (Get-EnvValue "NEXT_PUBLIC_APP_URL") { Get-EnvValue "NEXT_PUBLIC_APP_URL" } else { "https://app.wazo-digital.com" }
  "NEXT_PUBLIC_LANDING_URL"                = if (Get-EnvValue "NEXT_PUBLIC_LANDING_URL") { Get-EnvValue "NEXT_PUBLIC_LANDING_URL" } else { "https://wazo-digital.com" }
  "NEXT_PUBLIC_SUPABASE_URL"               = Get-EnvValue "NEXT_PUBLIC_SUPABASE_URL"
  "NEXT_PUBLIC_SUPABASE_ANON_KEY"          = Get-EnvValue "NEXT_PUBLIC_SUPABASE_ANON_KEY"
  "NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION"   = Get-EnvValue "NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION"
}

foreach ($entry in $map.GetEnumerator()) {
  Set-VercelEnv $entry.Key $entry.Value
}

$gsc = $map["NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION"]
if (-not $gsc) {
  Write-Host ""
  Write-Host "Google Search Console : ajoutez dans Landing/.env.local :" -ForegroundColor Yellow
  Write-Host "  NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION=<code depuis search.google.com>"
  Write-Host "  puis relancez ce script et : npx vercel --prod --yes"
}

Write-Host ""
Write-Host "Redeploy landing..." -ForegroundColor Cyan
npx vercel --prod --yes
