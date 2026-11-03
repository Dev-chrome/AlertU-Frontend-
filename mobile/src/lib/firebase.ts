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

import googleServices from '../../google-services.json';

type GoogleServicesConfig = {
  project_info?: {
    project_id?: string;
    project_number?: string;
    storage_bucket?: string;
  };
  client?: {
    api_key?: { current_key?: string }[];
    client_info?: { mobilesdk_app_id?: string };
  }[];
};

// google-services.json contains public Firebase client identifiers, not private
// credentials. The service-account private key stays on the backend only.
const firebaseClient = googleServices as GoogleServicesConfig;
const androidClient = firebaseClient.client?.[0];

const projectId =
  firebaseClient.project_info?.project_id ??
  process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID;

const firebaseConfig = {
  apiKey:
    androidClient?.api_key?.[0]?.current_key ??
    process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain:
    process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN ??
    (projectId ? `${projectId}.firebaseapp.com` : undefined),
  projectId,
  storageBucket:
    firebaseClient.project_info?.storage_bucket ??
    process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET ??
    (projectId ? `${projectId}.firebasestorage.app` : undefined),
  messagingSenderId:
    firebaseClient.project_info?.project_number ??
    process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId:
    androidClient?.client_info?.mobilesdk_app_id ??
    process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

const missingConfig = Object.entries(firebaseConfig)
  .filter(([, value]) => !value)
  .map(([key]) => key);

if (missingConfig.length > 0) {
  throw new Error(
    `Firebase client configuration is missing: ${missingConfig.join(', ')}. ` +
      'Check mobile/google-services.json.'
  );
}

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
