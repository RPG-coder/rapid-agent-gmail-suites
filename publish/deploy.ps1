# Rapid Agent Gmail Suite - Automated Deployment Script (PowerShell)
# This script uses 'clasp' to push code and create a versioned deployment.

Write-Host "Starting deployment to Google Apps Script..." -ForegroundColor Cyan

# 1. Check for .clasp.json (The Link)
if (-not (Test-Path "publish/.clasp.json")) {
    Write-Host "ERROR: No .clasp.json found in publish folder." -ForegroundColor Red
    Write-Host "You must link this folder to an Apps Script project first."
    Write-Host ""
    Write-Host "Run one of these commands inside the 'publish' folder:"
    Write-Host "  npx clasp clone <YOUR_SCRIPT_ID>  (To link existing)"
    Write-Host "  npx clasp create --title 'Rapid Agent Gmail Suite' --type gmail (To create new)"
    Write-Host ""
    exit 1
}

# 2. Check if clasp is installed locally
if (-not (Test-Path "publish/node_modules")) {
    Write-Host "Installing dependencies (clasp)..." -ForegroundColor Yellow
    Set-Location publish
    npm install
    Set-Location ..
}

# 3. Push the latest code
Write-Host "Pushing latest code to Apps Script..." -ForegroundColor Yellow
Set-Location publish
npx clasp push

# 4. Create a new versioned deployment
Write-Host "Creating a new versioned deployment..." -ForegroundColor Yellow
$deployOutput = npx clasp deploy --description "Build: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" | Out-String

Write-Host "------------------------------------------------" -ForegroundColor Green
Write-Host "Deployment complete!" -ForegroundColor Green
Write-Host ""
Write-Host "CRITICAL: Copy the NEW Deployment ID below into your GCP Console"
Write-Host "Google Workspace Marketplace SDK > App Configuration > Gmail Add-on"
Write-Host "------------------------------------------------" -ForegroundColor Green

# Extract the new Deployment ID (it's the one starting with AKfycb)
if ($deployOutput -match "(AKfycb[a-zA-Z0-9_-]+)") {
    $matches[1]
} else {
    Write-Host "Could not find NEW ID automatically." -ForegroundColor Red
    Write-Host "Full output:"
    Write-Host $deployOutput
}
Write-Host "------------------------------------------------" -ForegroundColor Green
Set-Location ..

