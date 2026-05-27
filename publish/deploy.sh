#!/bin/bash

# Rapid Agent Gmail Suite - Automated Deployment Script (Bash)
# This script uses Webpack to bundle and clasp to deploy.

echo "🚀 Starting Optimized Deployment to Google Apps Script..."

# 1. Ensure we are in the publish directory
cd publish || { echo "❌ Failed to enter publish directory"; exit 1; }

# 2. Check for .clasp.json (The Link)
if [ ! -f ".clasp.json" ]; then
    echo "❌ ERROR: No .clasp.json found."
    exit 1
fi

# 3. Ensure dependencies are installed
echo "📦 Checking dependencies..."
npm install --silent

# 4. Build the optimized bundle with Webpack
echo "🛠️  Building optimized bundle with Webpack..."
npm run build

# 5. Ensure appsscript.json is in dist (clasp pushes from dist)
if [ ! -f "dist/appsscript.json" ]; then
    cp "appsscript.json" "dist/appsscript.json"
fi

# 6. Push the latest code
echo "☁️  Pushing bundled code to Apps Script..."
npx clasp push -f

# 7. Create a new versioned deployment
echo "🔖 Creating a new versioned deployment..."
DEPLOYMENT_OUTPUT=$(npx clasp deploy --description "Optimized Release: $(date +'%Y-%m-%d %H:%M')")

echo "------------------------------------------------"
echo "✅ Deployment complete!"
echo ""
echo "CRITICAL: Copy the NEW Deployment ID below into your GCP Console"
echo "Google Workspace Marketplace SDK > App Configuration > Gmail Add-on"
echo "------------------------------------------------"

# Extract the new Deployment ID (it's the one starting with AKfycb)
echo "$DEPLOYMENT_OUTPUT" | grep -oE "AKfycb[a-zA-Z0-9_-]+" | tail -n 1

echo "------------------------------------------------"
cd ..
