"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.COLLECTIONS = exports.getDb = void 0;
const app_1 = require("firebase-admin/app");
const firestore_1 = require("firebase-admin/firestore");
// Initialize Firebase Admin SDK
const initializeFirebase = () => {
    if ((0, app_1.getApps)().length === 0) {
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
                }
                catch (error) {
                    // If base64 decoding fails, treat as plain text
                }
            }
            // Replace escaped newlines with actual newlines
            privateKey = privateKey.replace(/\\n/g, '\n');
            (0, app_1.initializeApp)({
                credential: (0, app_1.cert)({
                    projectId: process.env.FIREBASE_PROJECT_ID,
                    privateKey: privateKey,
                    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                }),
            });
            console.log('Firebase initialized successfully');
        }
        catch (error) {
            console.error('Firebase initialization failed:', error);
            console.log('Falling back to in-memory storage');
        }
    }
};
// Export a function to get initialized Firestore instance
const getDb = () => {
    if ((0, app_1.getApps)().length === 0) {
        if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_CLIENT_EMAIL) {
            initializeFirebase();
        }
    }
    return (0, app_1.getApps)().length > 0 ? (0, firestore_1.getFirestore)() : null;
};
exports.getDb = getDb;
// Collection names
exports.COLLECTIONS = {
    ROOMS: 'rooms',
    SETTINGS: 'settings',
};
//# sourceMappingURL=firebase.js.map