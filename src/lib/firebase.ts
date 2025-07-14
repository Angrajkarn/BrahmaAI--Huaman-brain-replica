
import { initializeApp, getApp, getApps, type FirebaseApp } from "firebase/app";
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  sendPasswordResetEmail,
  onAuthStateChanged,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  GoogleAuthProvider,
  signInWithPopup,
  type User as FirebaseUser,
  type Auth,
} from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getStorage, type FirebaseStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

let firebaseAppInitialized = false;

// Check for all required Firebase environment variables for the client-side SDK.
const missingVars = Object.entries(firebaseConfig)
  .filter(([key, value]) => !value || (typeof value === 'string' && value.includes('YOUR_')) || key === 'authDomain' && (!value || (typeof value === 'string' && value.includes('YOUR_'))))
  .map(([key]) => `NEXT_PUBLIC_FIREBASE_${key.replace(/([A-Z])/g, '_$1').toUpperCase()}`);

if (missingVars.length > 0) {
  console.warn(
    "--- FIREBASE CLIENT-SIDE CONFIGURATION WARNING ---"
  );
  console.warn(
    `Firebase Warning: One or more client-side Firebase environment variables are not configured correctly in your .env file. Affected variables: ${missingVars.join(', ')}.`
  );
  console.warn(
    "Client-side Firebase services (like authentication, file uploads, and real-time updates) WILL NOT WORK until this is corrected. Please update your .env file with your actual Firebase project details and RESTART THE DEVELOPMENT SERVER."
  );
   console.warn(
    "--------------------------------------------------"
  );
} else {
  firebaseAppInitialized = true;
}

let app: FirebaseApp | undefined = undefined;
let authInstance: Auth | null = null;
let db: Firestore | null = null;
let storage: FirebaseStorage | null = null;

if (firebaseAppInitialized) {
  if (!getApps().length) {
    app = initializeApp(firebaseConfig);
  } else {
    app = getApp();
  }
  authInstance = getAuth(app);
  db = getFirestore(app);
  storage = getStorage(app);
} else {
  console.warn(
    "Firebase Client-Side SDK is NOT INITIALIZED due to missing or incorrect configuration in .env. App functionality will be severely limited or broken. Please check console warnings above for details and update your .env file, then RESTART the server."
  );
}

export { 
  app, 
  authInstance as auth, 
  db, 
  storage, 
  firebaseAppInitialized,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  GoogleAuthProvider,
  signInWithPopup,
  type FirebaseUser
};
