# Specs Development Runner Orchestrator
$SpecsDir = "C:\Users\Admin\Specs"
$DevToolsDir = "$SpecsDir\dev-tools"
$NodeDir = "$DevToolsDir\node"
$PgDir = "$DevToolsDir\pgsql"

# Add portable node to PATH for this process session
$env:PATH = "$NodeDir;$env:PATH"

Write-Host "--- LEKYA SPECS DEVELOPMENT RUNNER ---" -ForegroundColor Yellow

# 1. Start PostgreSQL if not already running
$pgRunning = Get-Process -Name postgres -ErrorAction SilentlyContinue
if (-not $pgRunning) {
    Write-Host "Starting portable PostgreSQL server..." -ForegroundColor Cyan
    if (Test-Path "$PgDir\bin\postgres.exe") {
        Start-Process -FilePath "$PgDir\bin\postgres.exe" -ArgumentList "-D", "$PgDir\data" -NoNewWindow
        Start-Sleep -Seconds 3
    } else {
        Write-Host "Error: postgres.exe not found at $PgDir\bin\postgres.exe" -ForegroundColor Red
    }
} else {
    Write-Host "PostgreSQL is already running." -ForegroundColor Green
}

# 2. Start Backend Express Server
Write-Host "Starting Express API Backend (Port 5000)..." -ForegroundColor Cyan
Start-Process -FilePath "powershell.exe" -ArgumentList "-NoExit", "-Command", "cd '$SpecsDir\backend'; `$env:PATH = '$NodeDir;' + `$env:PATH; node src/app.js"

# 3. Start Frontend Next.js Dev Server
Write-Host "Starting Next.js Frontend Storefront (Port 3000)..." -ForegroundColor Cyan
Start-Process -FilePath "powershell.exe" -ArgumentList "-NoExit", "-Command", "cd '$SpecsDir\frontend'; `$env:PATH = '$NodeDir;' + `$env:PATH; npm run dev"

Write-Host "`nAll systems boot commands dispatched!" -ForegroundColor Green
Write-Host "  Storefront: http://localhost:3000" -ForegroundColor Yellow
Write-Host "  API Server: http://localhost:5000" -ForegroundColor Yellow
Write-Host "  Admin Login: admin@specs.com / admin123" -ForegroundColor Cyan
Write-Host "`nKeep the spawned terminal windows open. To close PostgreSQL, run: pg_ctl -D '$PgDir\data' stop`n" -ForegroundColor DarkYellow
