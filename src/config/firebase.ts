import { initializeApp } from 'firebase/app';
import { getAuth, initializeAuth } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions';
import { getStorage } from 'firebase/storage';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyAacPYzjI-gPOOouk6Ovshe4Z59exvLAOw",
    authDomain: "fitquest-app-ad3c3.firebaseapp.com",
    projectId: "fitquest-app-ad3c3",
    storageBucket: "fitquest-app-ad3c3.firebasestorage.app",
    messagingSenderId: "109060227356",
    appId: "1:109060227356:web:836c8f0b6c63a981d1bad9",
    measurementId: "G-XNMC2XGX3B"
  };

// Initialize Firebase
let app;
try {
  app = initializeApp(firebaseConfig);
} catch (error: any) {
  // Handle duplicate app error
  if (error.code === 'app/duplicate-app') {
    console.log('Firebase app already initialized, using existing app');
    app = initializeApp(firebaseConfig, 'fitquest-secondary');
  } else {
    throw error;
  }
}

// Initialize Firebase Auth (simplified for React Native)
let auth;
try {
  auth = getAuth(app);
} catch (error: any) {
  console.log('Firebase auth initialization error:', error);
  auth = getAuth(app);
}

// Initialize Firestore
const db = getFirestore(app);

// Initialize Cloud Functions
const functions = getFunctions(app);

// Initialize Cloud Storage
const storage = getStorage(app);

// Development emulators (uncomment for local development)
// if (__DEV__) {
//   try {
//     connectFirestoreEmulator(db, 'localhost', 8080);
//     connectFunctionsEmulator(functions, 'localhost', 5001);
//   } catch (error) {
//     console.log('Emulator connection error:', error);
//   }
// }

export { auth, db, functions, storage };
export default app;