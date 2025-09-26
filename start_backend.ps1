# AI Task Manager Backend Starter (PowerShell)
# Easy way to start the Jac backend on Windows

param(
    [Parameter(Position=0)]
    [ValidateSet("start", "stop", "check", "monitor")]
    [string]$Action = "monitor"
)

$BackendDir = Join-Path $PSScriptRoot "ai-task-manager\backend"
$JacFile = Join-Path $BackendDir "task_manager_api.jac"
$Port = 8000
$Host = "localhost"

function Test-BackendRunning {
    try {
        $response = Invoke-WebRequest -Uri "http://${Host}:${Port}/HealthCheck" -TimeoutSec 2 -ErrorAction Stop
        return $response.StatusCode -eq 200
    }
    catch {
        return $false
    }
}

function Start-JacBackend {
    Write-Host "🚀 Starting Jac AI Backend..." -ForegroundColor Green
    
    if (Test-BackendRunning) {
        Write-Host "✅ Backend is already running at http://${Host}:${Port}" -ForegroundColor Green
        return $true
    }
    
    if (!(Test-Path $JacFile)) {
        Write-Host "❌ Jac backend file not found: $JacFile" -ForegroundColor Red
        return $false
    }
    
    try {
        Write-Host "📁 Working directory: $BackendDir" -ForegroundColor Cyan
        Write-Host "📄 Starting service from: $(Split-Path $JacFile -Leaf)" -ForegroundColor Cyan
        
        # Start the backend in a new process
        $process = Start-Process -FilePath "jac" -ArgumentList @("serve", $JacFile, "--host", $Host, "--port", $Port) -WorkingDirectory $BackendDir -PassThru -WindowStyle Hidden
        
        # Wait for startup
        Start-Sleep -Seconds 3
        
        if (Test-BackendRunning) {
            Write-Host "✅ Backend started successfully!" -ForegroundColor Green
            Write-Host "🔗 Health Check: http://${Host}:${Port}/HealthCheck" -ForegroundColor Yellow
            Write-Host "📊 Service Info: http://${Host}:${Port}/ServiceInfo" -ForegroundColor Yellow
            Write-Host "🎯 Frontend will automatically detect the backend" -ForegroundColor Cyan
            return $true
        }
        else {
            Write-Host "❌ Backend failed to start or is not responding" -ForegroundColor Red
            return $false
        }
    }
    catch {
        Write-Host "❌ Error starting backend: $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}

function Stop-JacBackend {
    Write-Host "🛑 Stopping Jac backend..." -ForegroundColor Yellow
    
    # Find jac processes
    $jacProcesses = Get-Process -Name "jac*" -ErrorAction SilentlyContinue
    
    if ($jacProcesses) {
        $jacProcesses | Stop-Process -Force
        Write-Host "✅ Backend processes stopped" -ForegroundColor Green
    }
    else {
        Write-Host "ℹ️ No backend processes found" -ForegroundColor Cyan
    }
}

function Start-BackendMonitoring {
    Write-Host "👁️ Starting backend with monitoring..." -ForegroundColor Cyan
    Write-Host "⌨️ Press Ctrl+C to stop" -ForegroundColor Yellow
    
    if (!(Start-JacBackend)) {
        return
    }
    
    try {
        while ($true) {
            Start-Sleep -Seconds 5
            
            if (!(Test-BackendRunning)) {
                Write-Host "⚠️ Backend not responding, restarting..." -ForegroundColor Yellow
                Start-JacBackend | Out-Null
            }
        }
    }
    catch {
        Write-Host "`n🛑 Monitoring stopped" -ForegroundColor Yellow
        Stop-JacBackend
    }
}

# Main execution
Write-Host "🤖 AI Task Manager Backend Controller" -ForegroundColor Magenta
Write-Host "=" * 50 -ForegroundColor Gray

switch ($Action) {
    "check" {
        if (Test-BackendRunning) {
            Write-Host "✅ Backend is running at http://${Host}:${Port}" -ForegroundColor Green
            exit 0
        }
        else {
            Write-Host "❌ Backend is not running" -ForegroundColor Red
            exit 1
        }
    }
    
    "start" {
        if (Start-JacBackend) {
            Write-Host "🎉 Backend started successfully!" -ForegroundColor Green
            Write-Host "💡 You can now use the frontend - it will auto-detect the backend" -ForegroundColor Cyan
        }
        else {
            Write-Host "❌ Failed to start backend" -ForegroundColor Red
            exit 1
        }
    }
    
    "stop" {
        Stop-JacBackend
    }
    
    "monitor" {
        Start-BackendMonitoring
    }
    
    default {
        Write-Host "Usage: .\start_backend.ps1 [start|stop|check|monitor]" -ForegroundColor Yellow
        Write-Host "  start   - Start backend once" -ForegroundColor Cyan
        Write-Host "  stop    - Stop backend processes" -ForegroundColor Cyan  
        Write-Host "  check   - Check if backend is running" -ForegroundColor Cyan
        Write-Host "  monitor - Start backend with auto-restart monitoring (default)" -ForegroundColor Cyan
    }
}