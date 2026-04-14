import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getMessaging, isSupported } from 'firebase/messaging';
import { getAnalytics, isSupported as isAnalyticsSupported } from 'firebase/analytics';

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Validate configuration
const validateConfig = () => {
  const requiredKeys = [
    'apiKey',
    'authDomain',
    'projectId',
    'storageBucket',
    'messagingSenderId',
    'appId',
  ];

  const missingKeys = requiredKeys.filter(
    (key) => !firebaseConfig[key as keyof typeof firebaseConfig]
  );

  if (missingKeys.length > 0) {
    console.warn(
      `[Firebase] Missing configuration keys: ${missingKeys.join(', ')}. ` +
      `Please set the corresponding environment variables.`
    );
  }
};

// Initialize Firebase only on client-side
export const initializeFirebase = () => {
  validateConfig();

  if (typeof window !== 'undefined') {
    if (getApps().length === 0) {
      return initializeApp(firebaseConfig);
    }
  }

  return null;
};

// Lazy getters for Firebase services
let auth: any = null;
let db: any = null;
let storage: any = null;
let messaging: any = null;
let analytics: any = null;

export const getAuthService = () => {
  if (typeof window === 'undefined') return null;
  if (!auth) {
    initializeFirebase();
    auth = getAuth();
  }
  return auth;
};

export const getFirestoreService = () => {
  if (typeof window === 'undefined') return null;
  if (!db) {
    initializeFirebase();
    db = getFirestore();
  }
  return db;
};

export const getStorageService = () => {
  if (typeof window === 'undefined') return null;
  if (!storage) {
    initializeFirebase();
    storage = getStorage();
  }
  return storage;
};

export const getMessagingService = async () => {
  if (typeof window === 'undefined') return null;
  if (!messaging) {
    const supported = await isSupported();
    if (supported) {
      initializeFirebase();
      messaging = getMessaging();
    }
  }
  return messaging;
};

export const getAnalyticsService = async () => {
  if (typeof window === 'undefined') return null;
  if (!analytics) {
    const supported = await isAnalyticsSupported();
    if (supported) {
      initializeFirebase();
      analytics = getAnalytics();
    }
  }
  return analytics;
};

export { firebaseConfig };
