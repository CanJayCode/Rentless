# Firebase Firestore Setup Guide

## Step 1: Create a Service Account

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project or create a new one
3. Click the gear icon (⚙️) → Project Settings
4. Click on the "Service accounts" tab
5. Click "Generate new private key"
6. This will download a JSON file like `your-project-firebase-adminsdk-xxxxx.json`

## Step 2: Extract the Required Values

From the downloaded JSON file, you need:

- **PROJECT_ID**: This is the `project_id` field
- **CLIENT_EMAIL**: This is the `client_email` field  
- **PRIVATE_KEY**: This is the `private_key` field (the long RSA key)

## Step 3: Set Environment Variables

The private key should look like:
```
-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC7...
(many lines of characters)
...
-----END PRIVATE KEY-----
```

## Current Issue

The FIREBASE_PRIVATE_KEY you provided appears to be a web API key (`AIzaSyB_...`) rather than a service account private key. You need the private key from the service account JSON file.

## Enable Firestore

1. In Firebase Console, go to Firestore Database
2. Click "Create database"
3. Choose "Start in test mode" for now
4. Select a location close to your users