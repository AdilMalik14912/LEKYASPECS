# Specs Environment Setup Script
$ErrorActionPreference = "Stop"

$SpecsDir = "C:\Users\Admin\Specs"
$DevToolsDir = "$SpecsDir\dev-tools"

# Create directories
Write-Host "Creating Specs directories..."
New-Item -ItemType Directory -Force -Path $DevToolsDir | Out-Null
New-Item -ItemType Directory -Force -Path "$SpecsDir\backend" | Out-Null
New-Item -ItemType Directory -Force -Path "$SpecsDir\frontend" | Out-Null

# Download and extract Node.js
$NodeZip = "$DevToolsDir\node.zip"
$NodeFinalDir = "$DevToolsDir\node"

if (-not (Test-Path "$NodeFinalDir\node.exe")) {
    Write-Host "Downloading Node.js..."
    curl.exe -L -o $NodeZip "https://nodejs.org/dist/v20.11.0/node-v20.11.0-win-x64.zip"
    
    Write-Host "Extracting Node.js..."
    tar.exe -xf $NodeZip -C $DevToolsDir
    
    # Move extracted folder to standard name
    $ExtractedNodeFolder = Get-ChildItem $DevToolsDir -Filter "node-v20.11.0-win-x64" | Select-Object -First 1
    Rename-Item -Path $ExtractedNodeFolder.FullName -NewName "node"
    
    # Clean up zip
    Remove-Item $NodeZip -Force
    Write-Host "Node.js set up successfully."
} else {
    Write-Host "Node.js already set up."
}

# Download and extract PostgreSQL
$PostgresZip = "$DevToolsDir\postgres.zip"
$PostgresFinalDir = "$DevToolsDir\pgsql"

if (-not (Test-Path "$PostgresFinalDir\bin\pg_ctl.exe")) {
    Write-Host "Downloading PostgreSQL..."
    curl.exe -L -o $PostgresZip "https://get.enterprisedb.com/postgresql/postgresql-16.3-1-windows-x64-binaries.zip"
    
    Write-Host "Extracting PostgreSQL..."
    tar.exe -xf $PostgresZip -C $DevToolsDir
    
    # Clean up zip
    Remove-Item $PostgresZip -Force
    Write-Host "PostgreSQL set up successfully."
} else {
    Write-Host "PostgreSQL already set up."
}

# Initialize PostgreSQL Database if not done
$DbDataDir = "$PostgresFinalDir\data"
if (-not (Test-Path "$DbDataDir\PG_VERSION")) {
    Write-Host "Initializing PostgreSQL Database..."
    # Create password file for initdb
    $PasswordFile = "$DevToolsDir\pg_pwd.txt"
    "postgres" | Out-File -FilePath $PasswordFile -Encoding ascii
    
    # Run initdb
    & "$PostgresFinalDir\bin\initdb.exe" -D $DbDataDir -U postgres --pwfile=$PasswordFile
    
    # Clean up password file
    Remove-Item $PasswordFile -Force
    Write-Host "PostgreSQL Database initialized."
} else {
    Write-Host "PostgreSQL Database data directory already exists."
}

Write-Host "Dev Tools setup complete!"
