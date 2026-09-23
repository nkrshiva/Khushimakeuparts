import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyDudcuIRHOs889JEu0XyySoxvAMPf97ExA',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'khushimakeuparts865.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'khushimakeuparts865',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'khushimakeuparts865.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '831500877608',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:831500877608:web:30436b1e4db75af673da1d',
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || 'G-XZE5HPB9YD',
};

let appInstance: any = null;
let authInstance: Auth | null = null;
let dbInstance: Firestore | null = null;
let storageInstance: FirebaseStorage | null = null;

try {
  appInstance = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
  authInstance = getAuth(appInstance);
  dbInstance = getFirestore(appInstance);
  storageInstance = getStorage(appInstance);
} catch (e) {
  console.warn('Firebase initialization error in client:', e);
}

export const app = appInstance;
export const auth = authInstance;
export const db = dbInstance;
export const storage = storageInstance;
export default app;
