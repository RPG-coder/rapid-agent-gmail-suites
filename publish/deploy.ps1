# Rapid Agent Gmail Suite - Automated Deployment Script (PowerShell)
# This script uses Webpack to bundle and clasp to deploy.

Write-Host "Starting Optimized Deployment to Google Apps Script..." -ForegroundColor Cyan

# 1. Ensure we are in the publish directory
Set-Location publish

# 2. Check for .clasp.json (The Link)
if (-not (Test-Path ".clasp.json")) {
    Write-Host "ERROR: No .clasp.json found." -ForegroundColor Red
    exit 1
}

# 3. Ensure dependencies are installed
Write-Host "Checking dependencies..." -ForegroundColor Yellow
npm install --silent

# 4. Build the optimized bundle with Webpack
Write-Host "Building optimized bundle with Webpack..." -ForegroundColor Yellow
npm run build

# 5. Ensure appsscript.json is in dist (clasp pushes from dist)
if (!(Test-Path "dist/appsscript.json")) {
    Copy-Item "appsscript.json" "dist/appsscript.json"
}

# 6. Push the latest code
Write-Host "Pushing bundled code to Apps Script..." -ForegroundColor Yellow
npx clasp push -f

# 7. Create a new versioned deployment
Write-Host "Creating a new versioned deployment..." -ForegroundColor Yellow
$deployOutput = npx clasp deploy --description "Optimized Release: $(Get-Date -Format 'yyyy-MM-dd HH:mm')" | Out-String

Write-Host "------------------------------------------------" -ForegroundColor Green
Write-Host "Deployment complete!" -ForegroundColor Green
Write-Host ""
Write-Host "CRITICAL: Copy the NEW Deployment ID below into your GCP Console"
Write-Host "------------------------------------------------" -ForegroundColor Green

if ($deployOutput -match "(AKfycb[a-zA-Z0-9_-]+)") {
    $matches[1]
} else {
    Write-Host "Could not find NEW ID automatically." -ForegroundColor Red
    Write-Host $deployOutput
}
Write-Host "------------------------------------------------" -ForegroundColor Green
Set-Location ..
