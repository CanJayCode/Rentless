#!/bin/bash

# Render Build Script for Room Management System
echo "🔨 Starting build process..."

# Install all dependencies (including devDependencies)
echo "📦 Installing dependencies..."
npm ci --include=dev

# Build frontend with Vite
echo "🎨 Building frontend..."
npx vite build

# Build backend with esbuild
echo "⚙️ Building backend..."
npx esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist

echo "✅ Build completed successfully!"