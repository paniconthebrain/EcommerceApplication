# GoGO Pantry — Start all servers
# Run: powershell -ExecutionPolicy Bypass -File start.ps1

$ROOT = $PSScriptRoot
Write-Host "`n  Starting GoGO Pantry..." -ForegroundColor Cyan

Start-Process powershell -ArgumentList "-NoExit", "-Command", `
    "Write-Host 'Backend API — port 3000' -ForegroundColor Cyan; cd '$ROOT\backend'; npm start"

Start-Sleep 2

Start-Process powershell -ArgumentList "-NoExit", "-Command", `
    "Write-Host 'Customer App — port 3001' -ForegroundColor Green; cd '$ROOT\GoGO Pantry Customer WebApp'; node server.js"

Start-Process powershell -ArgumentList "-NoExit", "-Command", `
    "Write-Host 'Staff App — port 3002' -ForegroundColor Yellow; cd '$ROOT\GoGO Pantry Staff'; node server.js"

Write-Host ""
Write-Host "  Backend API:   http://localhost:3000" -ForegroundColor White
Write-Host "  Customer App:  http://localhost:3001" -ForegroundColor White
Write-Host "  Staff App:     http://localhost:3002" -ForegroundColor White
Write-Host ""
