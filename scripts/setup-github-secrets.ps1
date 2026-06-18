# Configure GitHub Actions secrets for Landing monitor + E2E.
# Usage: powershell -ExecutionPolicy Bypass -File scripts/setup-github-secrets.ps1
# Requires: gh auth login

$ErrorActionPreference = "Stop"
Set-Location (Join-Path $PSScriptRoot "..")

function Read-DotEnvValue([string]$filePath, [string]$key) {
  if (-not (Test-Path $filePath)) { return "" }
  $line = Get-Content $filePath | Where-Object { $_ -match "^$key=" } | Select-Object -First 1
  if (-not $line) { return "" }
  return ($line -replace "^$key=", "").Trim().Trim('"').Trim("'")
}

$wazoEnv = Join-Path (Split-Path $PWD -Parent) "wazo-digital\.env.local"
$localEnv = Join-Path $PWD ".env.local"

function Get-EnvValue([string]$key) {
  $v = Read-DotEnvValue $localEnv $key
  if ($v) { return $v }
  return Read-DotEnvValue $wazoEnv $key
}

$repo = "jacques99e/landing-jacques99e"
if (-not (gh auth status 2>$null)) {
  Write-Host "Connectez GitHub : gh auth login" -ForegroundColor Yellow
  gh auth login
}

$secrets = @{
  E2E_OWNER_EMAIL              = if (Get-EnvValue "E2E_OWNER_EMAIL") { Get-EnvValue "E2E_OWNER_EMAIL" } else { "test.owner@wazo.africa" }
  E2E_OWNER_PASSWORD            = if (Get-EnvValue "E2E_OWNER_PASSWORD") { Get-EnvValue "E2E_OWNER_PASSWORD" } else { "TestOwner2026!" }
  NEXT_PUBLIC_SUPABASE_URL      = Get-EnvValue "NEXT_PUBLIC_SUPABASE_URL"
  NEXT_PUBLIC_SUPABASE_ANON_KEY = Get-EnvValue "NEXT_PUBLIC_SUPABASE_ANON_KEY"
  SUPABASE_SERVICE_ROLE_KEY     = Get-EnvValue "SUPABASE_SERVICE_ROLE_KEY"
}

Write-Host "=== Secrets GitHub → $repo ===" -ForegroundColor Cyan
foreach ($entry in $secrets.GetEnumerator()) {
  if ([string]::IsNullOrWhiteSpace($entry.Value)) {
    Write-Host "[skip] $($entry.Key) (vide dans .env.local)" -ForegroundColor Yellow
    continue
  }
  gh secret set $entry.Key --body $entry.Value --repo $repo
  Write-Host "[set] $($entry.Key)"
}

$webhook = Get-EnvValue "MONITOR_WEBHOOK_URL"
if ($webhook) {
  gh secret set MONITOR_WEBHOOK_URL --body $webhook --repo $repo
  Write-Host "[set] MONITOR_WEBHOOK_URL"
} else {
  Write-Host "[skip] MONITOR_WEBHOOK_URL (optionnel)"
}

Write-Host ""
Write-Host "Secrets configurés. Déclenchez le workflow :" -ForegroundColor Green
Write-Host "  gh workflow run monitor-production.yml --repo $repo"
