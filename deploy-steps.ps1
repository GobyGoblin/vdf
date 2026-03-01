# German Talent Connect - Deploy to Render
# Run this from the project root (german-talent-connect-main)

$ErrorActionPreference = "Stop"
Write-Host "`n=== German Talent Connect - Deploy preparation ===`n" -ForegroundColor Cyan

# 1. Build frontend
Write-Host "1. Building frontend (Vite)..." -ForegroundColor Yellow
npm run build
if ($LASTEXITCODE -ne 0) { throw "Frontend build failed." }
Write-Host "   Done.`n" -ForegroundColor Green

# 2. Install server deps (needed for production start)
Write-Host "2. Installing server dependencies..." -ForegroundColor Yellow
Push-Location server
npm install --omit=dev
Pop-Location
Write-Host "   Done.`n" -ForegroundColor Green

# 3. Optional: run production server locally to verify
Write-Host "3. To run production build locally:" -ForegroundColor Yellow
Write-Host "   `$env:NODE_ENV='production'; node server/server.js" -ForegroundColor White
Write-Host "   Then open http://localhost:3001`n" -ForegroundColor White

Write-Host "=== Next: Push to GitHub and deploy on Render ===`n" -ForegroundColor Cyan
Write-Host "A. Create a new repo on GitHub: https://github.com/new" -ForegroundColor White
Write-Host "   Name it e.g. german-talent-connect (no README needed).`n" -ForegroundColor Gray
Write-Host "B. Push this folder (replace YOUR_USERNAME and REPO_NAME):" -ForegroundColor White
Write-Host "   git remote add origin https://github.com/YOUR_USERNAME/REPO_NAME.git" -ForegroundColor Gray
Write-Host "   git branch -M main" -ForegroundColor Gray
Write-Host "   git push -u origin main`n" -ForegroundColor Gray
Write-Host "C. Deploy on Render:" -ForegroundColor White
Write-Host "   1. Go to https://dashboard.render.com" -ForegroundColor Gray
Write-Host "   2. New -> Web Service" -ForegroundColor Gray
Write-Host "   3. Connect your GitHub repo" -ForegroundColor Gray
Write-Host "   4. Use these settings:" -ForegroundColor Gray
Write-Host "      Build:  npm install && npm run build && cd server && npm install" -ForegroundColor Gray
Write-Host "      Start:  node server/server.js" -ForegroundColor Gray
Write-Host "   5. Environment (in Render dashboard):" -ForegroundColor Gray
Write-Host "      NODE_ENV = production" -ForegroundColor Gray
Write-Host "      JWT_SECRET = (generate a long random string)" -ForegroundColor Gray
Write-Host "      CORS_ORIGIN = https://YOUR-SERVICE-NAME.onrender.com" -ForegroundColor Gray
Write-Host "   6. Deploy. Your app will be live at the URL Render gives you.`n" -ForegroundColor Gray
