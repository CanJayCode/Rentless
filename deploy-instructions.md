# Vercel Deployment Instructions

## Quick Deploy
1. Install Vercel CLI: `npm install -g vercel`
2. Login: `vercel login`
3. Deploy: `vercel --prod`

## Manual Steps

### Prerequisites
1. Install Firebase CLI: `npm install -g firebase-tools`
2. Login to Firebase: `firebase login`

### Deploy Steps
```bash
# 1. Build the project
npm run build

# 2. Deploy to Vercel
vercel --prod
```

### First Time Setup
```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy
vercel --prod
```

### Environment Variables for Vercel

You'll need to set these environment variables in your Vercel dashboard:

1. Go to your Vercel project dashboard
2. Navigate to Settings → Environment Variables
3. Add these variables:

```
FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_PRIVATE_KEY=your-firebase-private-key
FIREBASE_CLIENT_EMAIL=your-firebase-client-email
```

### Troubleshooting Blank Page

If you see a blank page after deployment:

1. **Check Browser Console**: Open developer tools and look for JavaScript errors
2. **Check API Connection**: Verify the API endpoints are responding
3. **Check Function Logs**: Go to Vercel dashboard → Functions tab to see server logs
4. **Verify Environment Variables**: Make sure all Firebase credentials are set

### Quick Deploy Script

Just run: `./deploy-vercel.sh`

Or manually:
```bash
npm run build
npx vercel --prod
```

## Project Structure
- `dist/` - Built frontend files
- `functions/` - Backend Firebase Functions
- `firebase.json` - Firebase configuration
- `.firebaserc` - Project configuration

## Important Notes
- Backend will run as Firebase Functions
- Frontend will be served from Firebase Hosting
- Firestore is already configured and working
- All your Firebase secrets are already set up

## Current Status
✅ Firebase configuration files created
✅ Functions code prepared
✅ Frontend built and ready
✅ Firestore database connected

## Next Steps
1. Replace "YOUR_PROJECT_ID" in `.firebaserc` with your actual Firebase project ID
2. Run `firebase deploy` to deploy your application
3. Your app will be available at: `https://your-project-id.web.app`