import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Initialize Firebase Admin SDK
const initializeFirebase = () => {
  if (getApps().length === 0) {
    try {
      if (!process.env.FIREBASE_PROJECT_ID || !process.env.FIREBASE_PRIVATE_KEY || !process.env.FIREBASE_CLIENT_EMAIL) {
        console.log('Firebase credentials not found - using in-memory storage');
        return;
      }

      // Handle the private key - it might be base64 encoded or have escaped newlines
      let privateKey = process.env.FIREBASE_PRIVATE_KEY;
      
      // If it doesn't start with -----BEGIN, it might be base64 encoded
      if (!privateKey.startsWith('-----BEGIN')) {
        try {
          privateKey = Buffer.from(privateKey, 'base64').toString('utf8');
        } catch (error) {
          // If base64 decoding fails, treat as plain text
        }
      }
      
      // Replace escaped newlines with actual newlines
      privateKey = privateKey.replace(/\\n/g, '\n');

      initializeApp({
        credential: cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          privateKey: privateKey,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        }),
      });
      
      console.log('Firebase initialized successfully');
    } catch (error) {
      console.error('Firebase initialization failed:', error);
      console.log('Falling back to in-memory storage');
    }
  }
};

// Initialize Firebase (with error handling)
if (process.env.USE_FIRESTORE === 'true') {
  initializeFirebase();
}

// Export Firestore instance (only if initialized)
export const db = getApps().length > 0 ? getFirestore() : null;

// Collection names
export const COLLECTIONS = {
  ROOMS: 'rooms',
  SETTINGS: 'settings',
} as const;