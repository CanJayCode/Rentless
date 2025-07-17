#!/bin/bash

echo "🚀 Deploying to Firebase Hosting and Functions..."

# Build the frontend
echo "📦 Building frontend..."
npm run build

# Build the functions
echo "🔧 Building Firebase Functions..."
cd functions
npm run build
cd ..

# Check if Firebase CLI is available
if ! command -v firebase &> /dev/null; then
    echo "❌ Firebase CLI not found. Install it with: npm install -g firebase-tools"
    echo "💡 Then run: firebase login"
    exit 1
fi

# Deploy everything
echo "🌐 Deploying to Firebase..."
firebase deploy

echo "✅ Deployment complete!"
echo "🌍 Your app is now live on Firebase Hosting"
echo "📱 Visit your app at: https://YOUR_PROJECT_ID.web.app"