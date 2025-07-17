#!/bin/bash

echo "🚀 Starting Firebase deployment process..."

# 1. Clean and build frontend
echo "📦 Building frontend..."
npm run build

# 2. Install functions dependencies
echo "📦 Installing functions dependencies..."
cd functions
npm install
npm run build
cd ..

# 3. Deploy to Firebase
echo "🔥 Deploying to Firebase..."
firebase deploy

echo "✅ Deployment complete!"
echo "Your app should be available at: https://rentless-38f72.web.app"
echo ""
echo "If you see a blank page, check:"
echo "1. Browser console for JavaScript errors"
echo "2. Firebase Functions logs for API errors"
echo "3. Make sure Firestore rules allow read/write access"