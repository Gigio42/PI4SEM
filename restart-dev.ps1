# Restart development servers
Write-Host "🛑 Stopping any running Node.js processes..." -ForegroundColor Yellow
taskkill /F /IM node.exe 2>$null

Write-Host "⏱️ Waiting for processes to terminate..." -ForegroundColor Yellow
Start-Sleep -Seconds 2

Write-Host "🚀 Starting development servers..." -ForegroundColor Green
Set-Location "$PSScriptRoot"
Start-Process -FilePath "npm" -ArgumentList "run", "dev" -NoNewWindow

Write-Host "✅ Development servers started. Browse to http://localhost:3001" -ForegroundColor Green
