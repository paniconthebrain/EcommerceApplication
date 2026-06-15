# ============================================================
# GoGO Pantry -- Windows Auto Setup Script
# Run: Right-click -> "Run with PowerShell" or:
#   powershell -ExecutionPolicy Bypass -File setup.ps1
# ============================================================

$ErrorActionPreference = "Stop"

function Write-Step($msg)  { Write-Host "`n==> $msg" -ForegroundColor Cyan }
function Write-OK($msg)    { Write-Host "  [OK] $msg" -ForegroundColor Green }
function Write-WARN($msg)  { Write-Host "  [!!] $msg" -ForegroundColor Yellow }
function Write-FAIL($msg)  { Write-Host "  [XX] $msg" -ForegroundColor Red }

Write-Host ""
Write-Host "  +----------------------------------+" -ForegroundColor Green
Write-Host "  |   GoGO Pantry -- Auto Setup      |" -ForegroundColor Green
Write-Host "  +----------------------------------+" -ForegroundColor Green
Write-Host ""

# -- 1. Node.js ------------------------------------------------
Write-Step "Checking Node.js..."
$nodeOk = $false
try {
    $nodeVer = node --version 2>$null
    $major   = [int]($nodeVer -replace 'v(\d+).*', '$1')
    if ($major -ge 18) {
        Write-OK "Node.js $nodeVer found"
        $nodeOk = $true
    } else {
        Write-WARN "Node.js $nodeVer is too old (need v18+). Will upgrade."
    }
} catch { Write-WARN "Node.js not found. Will install." }

if (-not $nodeOk) {
    Write-Step "Installing Node.js via winget..."
    try {
        winget install --id OpenJS.NodeJS.LTS --accept-package-agreements --accept-source-agreements -e
        $env:Path = [System.Environment]::GetEnvironmentVariable("Path", "Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path", "User")
        $nodeVer = node --version
        Write-OK "Node.js $nodeVer installed"
    } catch {
        Write-FAIL "Could not auto-install Node.js."
        Write-Host "  Please install manually from: https://nodejs.org" -ForegroundColor Yellow
        Read-Host "Press Enter after installing Node.js, then re-run this script"
        exit 1
    }
}

# -- 2. PostgreSQL ---------------------------------------------
Write-Step "Checking PostgreSQL..."
$pgOk = $false
try {
    $pgVer = psql --version 2>$null
    Write-OK "PostgreSQL found: $pgVer"
    $pgOk = $true
} catch { Write-WARN "PostgreSQL (psql) not found. Will install." }

if (-not $pgOk) {
    Write-Step "Installing PostgreSQL via winget..."
    try {
        winget install --id PostgreSQL.PostgreSQL --accept-package-agreements --accept-source-agreements -e
        $env:Path = [System.Environment]::GetEnvironmentVariable("Path", "Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path", "User")
        $psqlPaths = @(
            "C:\Program Files\PostgreSQL\17\bin",
            "C:\Program Files\PostgreSQL\16\bin",
            "C:\Program Files\PostgreSQL\15\bin",
            "C:\Program Files\PostgreSQL\14\bin"
        )
        foreach ($p in $psqlPaths) {
            if (Test-Path "$p\psql.exe") {
                $env:Path += ";$p"
                [System.Environment]::SetEnvironmentVariable("Path", $env:Path, "User")
                break
            }
        }
        Write-OK "PostgreSQL installed. Default password for 'postgres' user is 'postgres'."
        Write-WARN "If you set a different password during install, update it in backend\.env"
    } catch {
        Write-FAIL "Could not auto-install PostgreSQL."
        Write-Host "  Please install manually from: https://www.postgresql.org/download/windows/" -ForegroundColor Yellow
        Read-Host "Press Enter after installing PostgreSQL, then re-run this script"
        exit 1
    }
}

# -- 3. .env file ----------------------------------------------
Write-Step "Configuring backend environment..."
$envPath = Join-Path $PSScriptRoot "backend\.env"
if (Test-Path $envPath) {
    Write-OK "backend\.env already exists -- skipping"
} else {
    $jwtSecret = -join ((48..57) + (97..122) | Get-Random -Count 64 | ForEach-Object { [char]$_ })

    $pgPassword = Read-Host "  Enter your PostgreSQL 'postgres' user password (default: postgres)"
    if ([string]::IsNullOrWhiteSpace($pgPassword)) { $pgPassword = "postgres" }

    $envContent = @"
NODE_ENV=development
PORT=3000

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=gogopantry
DB_USER=postgres
DB_PASSWORD=$pgPassword

# JWT
JWT_SECRET=$jwtSecret
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# CORS
CORS_ORIGIN=http://localhost:3001,http://localhost:3002

# Email (optional -- leave as-is for dev)
GMAIL_USER=your-gmail@gmail.com
GMAIL_APP_PASSWORD=your-16-char-app-password
APP_URL=http://localhost:3001
"@
    $envContent | Out-File -FilePath $envPath -Encoding utf8
    Write-OK "backend\.env created"
}

# -- 4. npm install --------------------------------------------
Write-Step "Installing root dependencies..."
Push-Location $PSScriptRoot
npm install --silent
Write-OK "Root dependencies installed"
Pop-Location

Write-Step "Installing backend dependencies..."
Push-Location (Join-Path $PSScriptRoot "backend")
npm install --silent
Write-OK "Backend dependencies installed"
Pop-Location

Write-Step "Installing Customer Webapp dependencies..."
Push-Location (Join-Path $PSScriptRoot "GoGO Pantry Customer WebApp")
if (Test-Path "package.json") {
    npm install --silent
    Write-OK "Customer webapp dependencies installed"
} else {
    Write-OK "No package.json -- skipping"
}
Pop-Location

Write-Step "Installing Staff Webapp dependencies..."
Push-Location (Join-Path $PSScriptRoot "GoGO Pantry Staff")
if (Test-Path "package.json") {
    npm install --silent
    Write-OK "Staff webapp dependencies installed"
} else {
    Write-OK "No package.json -- skipping"
}
Pop-Location

# -- 5. Create PostgreSQL database -----------------------------
Write-Step "Setting up PostgreSQL database..."

$envVars = @{}
Get-Content $envPath | ForEach-Object {
    if ($_ -match '^\s*([^#][^=]+)=(.*)$') {
        $envVars[$matches[1].Trim()] = $matches[2].Trim()
    }
}
$env:PGPASSWORD = $envVars["DB_PASSWORD"]
$pgUser = $envVars["DB_USER"]
$dbName = $envVars["DB_NAME"]

try {
    $exists = psql -U $pgUser -lqt 2>$null | Select-String $dbName
    if ($exists) {
        Write-OK "Database '$dbName' already exists -- skipping creation"
    } else {
        psql -U $pgUser -c "CREATE DATABASE $dbName;" 2>$null
        Write-OK "Database '$dbName' created"
    }
} catch {
    Write-WARN "Could not connect to PostgreSQL automatically."
    Write-Host "  Run this manually in psql: CREATE DATABASE $dbName;" -ForegroundColor Yellow
}

# -- 6. Seed database ------------------------------------------
Write-Step "Seeding database..."
Push-Location (Join-Path $PSScriptRoot "backend")
try {
    node seed.js
    Write-OK "Database seeded"
} catch {
    Write-WARN "Seed failed or already seeded -- continuing"
}
Pop-Location

# -- 7. Done ---------------------------------------------------
Write-Host ""
Write-Host "  +----------------------------------------+" -ForegroundColor Green
Write-Host "  |          Setup Complete!               |" -ForegroundColor Green
Write-Host "  +----------------------------------------+" -ForegroundColor Green
Write-Host "  |  Backend API:   http://localhost:3000  |" -ForegroundColor White
Write-Host "  |  Customer App:  http://localhost:3001  |" -ForegroundColor White
Write-Host "  |  Staff App:     http://localhost:3002  |" -ForegroundColor White
Write-Host "  +----------------------------------------+" -ForegroundColor Green
Write-Host ""
Write-Host "  To start the project, run: .\start.ps1" -ForegroundColor Cyan
Write-Host ""

$launch = Read-Host "  Start all servers now? (Y/n)"
if ($launch -ne "n" -and $launch -ne "N") {
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\backend'; npm start"
    Start-Sleep 2
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\GoGO Pantry Customer WebApp'; node server.js"
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\GoGO Pantry Staff'; node server.js"
    Write-OK "Servers started in separate windows"
}
