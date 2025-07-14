
import admin from 'firebase-admin';
import { getFirestore, type Firestore } from 'firebase-admin/firestore';

// This is a server-side only file.
// It uses service account credentials to initialize the Firebase Admin SDK.
// This SDK bypasses all security rules and should be used with caution in trusted server environments.

let adminDb: Firestore | undefined;

// Check if the app is already initialized to prevent errors on hot reloads
if (!admin.apps.length) {
    const serviceAccountString = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON;
    
    try {
        let credential;
        if (serviceAccountString) {
            // Use service account credentials if provided
            const serviceAccount = JSON.parse(serviceAccountString);
            credential = admin.credential.cert(serviceAccount);
            console.log("Firebase Admin SDK: Initializing with service account credentials...");
        } else {
            // Use default credentials in development/CI and log an informative message instead of a warning.
            console.log("Firebase Admin SDK Info: GOOGLE_APPLICATION_CREDENTIALS_JSON is not set. Using default application credentials. This is normal for local development.");
            credential = admin.credential.applicationDefault();
        }

        admin.initializeApp({
            credential,
            projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        });
        
        console.log('Firebase Admin SDK initialized successfully.');
        adminDb = getFirestore();

    } catch (e: any) {
        console.error('CRITICAL: Firebase Admin SDK initialization failed. `adminDb` is unavailable. Error:', e.message);
        if (!process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON && !process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID) {
            console.error("HINT: This error often occurs when GOOGLE_APPLICATION_CREDENTIALS_JSON and/or NEXT_PUBLIC_FIREBASE_PROJECT_ID are missing from your .env file. Please check your configuration and restart the server.");
        }
        adminDb = undefined;
    }
} else {
    // If already initialized, just get the firestore instance
    adminDb = getFirestore();
}

export { adminDb };
