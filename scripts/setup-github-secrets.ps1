# Configure GitHub Actions secrets for Landing monitor + E2E.
# Usage: powershell -ExecutionPolicy Bypass -File scripts/setup-github-secrets.ps1
# Requires: gh auth login

$ErrorActionPreference = "Stop"
Set-Location (Join-Path $PSScriptRoot "..")

function Read-DotEnvValue([string]$key) {
  $envPath = Join-Path $PWD ".env.local"
  if (-not (Test-Path $envPath)) { return "" }
  $line = Get-Content $envPath | Where-Object { $_ -match "^$key=" } | Select-Object -First 1
  if (-not $line) { return "" }
  return ($line -replace "^$key=", "").Trim().Trim('"').Trim("'")
}

$repo = "jacques99e/landing-jacques99e"
if (-not (gh auth status 2>$null)) {
  Write-Host "Connectez GitHub : gh auth login" -ForegroundColor Yellow
  gh auth login
}

$email = Read-DotEnvValue "E2E_OWNER_EMAIL"
if (-not $email) { $email = "test.owner@wazo.africa" }

$password = Read-DotEnvValue "E2E_OWNER_PASSWORD"
if (-not $password) { $password = "TestOwner2026!" }

Write-Host "=== Secrets GitHub → $repo ===" -ForegroundColor Cyan
gh secret set E2E_OWNER_EMAIL --body $email --repo $repo
gh secret set E2E_OWNER_PASSWORD --body $password --repo $repo

$webhook = Read-DotEnvValue "MONITOR_WEBHOOK_URL"
if ($webhook) {
  gh secret set MONITOR_WEBHOOK_URL --body $webhook --repo $repo
  Write-Host "[set] MONITOR_WEBHOOK_URL"
} else {
  Write-Host "[skip] MONITOR_WEBHOOK_URL (ajoutez dans .env.local si Slack/Discord)"
}

Write-Host ""
Write-Host "Secrets configurés. Déclenchez le workflow :" -ForegroundColor Green
Write-Host "  gh workflow run monitor-production.yml --repo $repo"
