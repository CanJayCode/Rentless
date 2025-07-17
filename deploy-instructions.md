# Firebase Hosting Deployment Instructions

## Quick Deploy
Just run: `./deploy.sh`

## Manual Steps

### Prerequisites
1. Install Firebase CLI: `npm install -g firebase-tools`
2. Login to Firebase: `firebase login`

### Deploy Steps
```bash
# 1. Build the project
npm run build

# 2. Build functions
cd functions && npm install && npm run build && cd ..

# 3. Deploy
firebase deploy
```

### Troubleshooting Blank Page

If you see a blank page after deployment:

1. **Check Browser Console**: Open developer tools and look for JavaScript errors
2. **Check API Connection**: The frontend might not be connecting to Firebase Functions
3. **Verify Firestore Rules**: Make sure your Firestore security rules allow read/write access
4. **Check Functions Logs**: Run `firebase functions:log` to see backend errors

### Firestore Security Rules
Make sure your Firestore rules allow access:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true; // Change this for production
    }
  }
}
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