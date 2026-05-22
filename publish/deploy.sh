#!/bin/bash

# Rapid Agent Gmail Suite - Automated Deployment Script
# This script uses 'clasp' to push code and create a versioned deployment.

echo "🚀 Starting deployment to Google Apps Script..."

# Ensure we are in the publish directory
cd "$(dirname "$0")"

# 1. Check for .clasp.json (The Link)
if [ ! -f ".clasp.json" ]; then
  echo "❌ ERROR: No .clasp.json found."
  echo "You must link this folder to an Apps Script project first."
  echo ""
  echo "Run one of these commands inside the 'publish' folder:"
  echo "  npx clasp clone <YOUR_SCRIPT_ID>  (To link existing)"
  echo "  npx clasp create --title 'Rapid Agent Gmail Suite' --type gmail (To create new)"
  echo ""
  exit 1
fi

# 2. Check if clasp is installed locally
if [ ! -d "node_modules" ]; then
  echo "📦 Installing dependencies (clasp)..."
  npm install
fi

# 1. Push the latest code to the 'HEAD' (for development/test deployments)
echo "📤 Pushing latest code to Apps Script..."
npx clasp push

# 2. Create a new versioned deployment (required for Marketplace SDK)
echo "🏷️ Creating a new deployment version..."
DEPLOYMENT_OUTPUT=$(npx clasp deploy --description "Build: $(date +'%Y-%m-%d %H:%M:%S')")

echo "------------------------------------------------"
echo "✅ Deployment complete!"
echo ""
echo "CRITICAL: Copy the Deployment ID below into your GCP Console"
echo "Google Workspace Marketplace SDK > App Configuration > Gmail Add-on"
echo "------------------------------------------------"
echo "$DEPLOYMENT_OUTPUT" | grep -oE "[-a-zA-Z0-9_]{10,}" | tail -n 1
echo "------------------------------------------------"
