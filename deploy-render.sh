#!/bin/bash

# Render Deployment Script for Room Management System
# This script prepares your project for deployment to Render

echo "🚀 Preparing Room Management System for Render deployment..."

# Check if render.yaml exists
if [ ! -f "render.yaml" ]; then
    echo "❌ render.yaml not found. Please ensure you're in the project root directory."
    exit 1
fi

echo "✅ render.yaml configuration found"

# Check if package.json has the correct scripts
if ! grep -q '"build":' package.json; then
    echo "❌ Build script not found in package.json"
    exit 1
fi

if ! grep -q '"start":' package.json; then
    echo "❌ Start script not found in package.json"
    exit 1
fi

echo "✅ Package.json scripts are correctly configured"

# Test build command locally
echo "🔨 Testing build process..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed. Please fix build errors before deploying."
    exit 1
fi

echo "✅ Build successful"

# Check if health endpoint exists
echo "🏥 Checking health endpoint..."
if grep -q "/api/status" server/routes.ts; then
    echo "✅ Health check endpoint found"
else
    echo "❌ Health check endpoint not found in routes"
    exit 1
fi

echo ""
echo "🎉 Your project is ready for Render deployment!"
echo ""
echo "Next steps:"
echo "1. Push your code to GitHub"
echo "2. Go to https://render.com and sign up/login"
echo "3. Click 'New +' → 'Blueprint'"
echo "4. Connect your GitHub repository"
echo "5. Render will automatically detect render.yaml and create:"
echo "   - Web Service (your app)"
echo "   - PostgreSQL database"
echo "6. Click 'Apply' to start deployment"
echo ""
echo "Your app will be available at: https://your-app-name.onrender.com"
echo "Database will be automatically connected via DATABASE_URL"
echo ""
echo "📚 For detailed instructions, see: RENDER_DEPLOYMENT.md"
echo ""
echo "⚠️  Remember:"
echo "   - Free tier sleeps after 15 min inactivity"
echo "   - Takes ~30-90 seconds to wake up"
echo "   - 750 hours/month runtime limit"
echo ""