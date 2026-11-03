import AsyncStorage from '@react-native-async-storage/async-storage';
import { getApp, getApps, initializeApp } from 'firebase/app';
import {
  getAuth,
  initializeAuth,
  type Auth,
} from 'firebase/auth';
// The React Native build of firebase/auth exports this, but the web typings do not.
// @ts-expect-error - present in @firebase/auth/dist/rn
import { getReactNativePersistence } from 'firebase/auth';
import { Platform } from 'react-native';

const projectId =
  process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID ?? 'alertu-a7a43';

const firebaseConfig = {
  apiKey:
    process.env.EXPO_PUBLIC_FIREBASE_API_KEY ??
    'AIzaSyCijuhwt52PKaXJ7aDgIdUG96kJom_ZUKs',
  authDomain:
    process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN ??
    `${projectId}.firebaseapp.com`,
  projectId,
  storageBucket:
    process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET ??
    `${projectId}.firebasestorage.app`,
  messagingSenderId:
    process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? '469158474213',
  appId:
    process.env.EXPO_PUBLIC_FIREBASE_APP_ID ??
    '1:469158474213:android:636ff8a9c9abec2722ff0c',
};

export const firebaseApp = getApps().length
  ? getApp()
  : initializeApp(firebaseConfig);

const createAuth = (): Auth => {
  if (Platform.OS === 'web') {
    return getAuth(firebaseApp);
  }

  try {
    return initializeAuth(firebaseApp, {
      persistence: getReactNativePersistence(AsyncStorage),
    });
  } catch {
    // Fast Refresh can call this twice; reuse the existing Auth instance.
    return getAuth(firebaseApp);
  }
};

export const firebaseAuth = createAuth();
