import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { initializeAuth, getAuth, type Auth } from 'firebase/auth';
// @ts-expect-error — firebase-js-sdk's exports map resolves types to its generic build regardless
// of platform, so this RN-only helper is missing from the type declarations even though the JS
// re-export works fine at runtime via Metro's "react-native" condition. Known upstream gap;
// see https://docs.expo.dev/guides/using-firebase/.
import { getReactNativePersistence } from 'firebase/auth';

// Firebase project config, exposed to client code via EXPO_PUBLIC_ env vars (see .env.example).
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

const firebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);

// On native, persist the session in AsyncStorage so users stay signed in across app restarts.
// The web SDK ships its own IndexedDB-based persistence, so it uses getAuth() directly.
export const auth: Auth =
  Platform.OS === 'web'
    ? getAuth(firebaseApp)
    : initializeAuth(firebaseApp, { persistence: getReactNativePersistence(AsyncStorage) });
