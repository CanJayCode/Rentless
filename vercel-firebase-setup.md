# Vercel Firebase Setup Guide

Your app is successfully deployed to Vercel but needs Firebase credentials to load and save data.

## Quick Fix Steps

### 1. Get Firebase Credentials
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project (or create a new one)
3. Go to Project Settings → Service Accounts
4. Click "Generate new private key"
5. Download the JSON file

### 2. Add Environment Variables to Vercel
1. Go to your [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project
3. Go to Settings → Environment Variables
4. Add these three variables from your Firebase JSON file:

| Variable Name | Value |
|---------------|-------|
| `FIREBASE_PROJECT_ID` | Your project ID |
| `FIREBASE_CLIENT_EMAIL` | The client_email from JSON |
| `FIREBASE_PRIVATE_KEY` | The private_key from JSON (entire string including `-----BEGIN` and `-----END`) |

### 3. Create Firestore Database
1. In Firebase Console, go to Firestore Database
2. Click "Create database"
3. Choose "Start in test mode" (for now)
4. Select a location close to your users

### 4. Redeploy
1. After adding environment variables, redeploy your Vercel app
2. Or wait a few minutes for automatic redeployment

## Alternative: Use In-Memory Storage (Temporary)
If you want to test without setting up Firebase, I can modify the app to work with in-memory storage on Vercel, but data won't persist between visits.

## Current Status
- ✅ Frontend deployed successfully
- ✅ API functions working
- ❌ Database connection needs Firebase credentials

Your app will work perfectly once these environment variables are added!