param(
  [int]$IntervalSeconds = 20,
  [int]$TimeoutSeconds = 10,
  [switch]$RunOnce
)

$ErrorActionPreference = "SilentlyContinue"

$LandingDir = "C:\Users\user\Desktop\Landing"
$AppDir = "C:\Users\user\Desktop\wazo-digital"

function Write-Log {
  param([string]$Message)
  $ts = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
  Write-Output "[$ts] $Message"
}

function Test-Url {
  param(
    [string]$Url,
    [int]$Timeout = 10
  )
  try {
    $resp = Invoke-WebRequest -Uri $Url -UseBasicParsing -TimeoutSec $Timeout
    return $resp.StatusCode -ge 200 -and $resp.StatusCode -lt 500
  } catch {
    return $false
  }
}

function Get-PortPids {
  param([int]$Port)
  $pids = @()
  $lines = netstat -ano | Select-String ":$Port\s+"
  foreach ($line in $lines) {
    $parts = ($line.ToString() -split "\s+") | Where-Object { $_ -ne "" }
    if ($parts.Length -gt 0) {
      $pid = $parts[$parts.Length - 1]
      if ($pid -match "^\d+$") {
        $pids += [int]$pid
      }
    }
  }
  return $pids | Sort-Object -Unique
}

function Kill-PortProcesses {
  param([int]$Port)
  $pids = Get-PortPids -Port $Port
  foreach ($pid in $pids) {
    Write-Log "Stopping PID $pid on port $Port"
    taskkill /PID $pid /T /F | Out-Null
  }
}

function Start-LandingServer {
  Write-Log "Starting landing on port 3000"
  Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$LandingDir'; npm run dev -- -p 3000"
}

function Start-AppServer {
  Write-Log "Starting app on port 3001"
  Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$AppDir'; npm run dev -- -p 3001"
}

function Ensure-Service {
  param(
    [string]$Name,
    [string]$Url,
    [int]$Port,
    [scriptblock]$StartAction
  )

  $healthy = Test-Url -Url $Url -Timeout $TimeoutSeconds
  if ($healthy) {
    Write-Log "$Name is healthy ($Url)"
    return
  }

  Write-Log "$Name is DOWN ($Url), restarting..."
  Kill-PortProcesses -Port $Port
  & $StartAction
}

Write-Log "Health monitor started (interval: $IntervalSeconds s)"
do {
  Ensure-Service -Name "Landing" -Url "http://localhost:3000/" -Port 3000 -StartAction ${function:Start-LandingServer}
  Ensure-Service -Name "Wazo App" -Url "http://localhost:3001/" -Port 3001 -StartAction ${function:Start-AppServer}

  if (-not $RunOnce) {
    Start-Sleep -Seconds $IntervalSeconds
  }
} while (-not $RunOnce)

Write-Log "Health monitor completed"
