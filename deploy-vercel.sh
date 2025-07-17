#!/bin/bash

echo "🚀 Starting Vercel deployment..."

# 1. Build the project
echo "📦 Building the project..."
npm run build

# 2. Deploy to Vercel
echo "🌐 Deploying to Vercel..."
npx vercel --prod

echo "✅ Deployment complete!"
echo ""
echo "Your app will be available at the URL provided by Vercel"
echo ""
echo "If you see issues after deployment:"
echo "1. Check the Vercel function logs in the dashboard"
echo "2. Make sure environment variables are set in Vercel"
echo "3. Verify the API endpoints are working"