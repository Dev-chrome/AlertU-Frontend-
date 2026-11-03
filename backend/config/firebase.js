'use strict';

const fs = require('fs');
const {
  initializeApp,
  getApps,
  cert,
} = require('firebase-admin/app');
const { getMessaging: getAdminMessaging } = require('firebase-admin/messaging');
const { getAuth: getAdminAuth } = require('firebase-admin/auth');
const env = require('./env');

const parseServiceAccountJson = () => {
  const raw = String(env.FIREBASE_SERVICE_ACCOUNT_JSON || '').trim();
  if (!raw) return null;

  const candidates = [raw];
  try {
    candidates.push(Buffer.from(raw, 'base64').toString('utf8'));
  } catch {
    // Not base64; the raw JSON candidate may still work.
  }

  for (const candidate of candidates) {
    try {
      const parsed = JSON.parse(candidate);
      if (parsed.project_id && parsed.private_key && parsed.client_email) {
        return parsed;
      }
    } catch {
      // Try the next representation.
    }
  }

  throw new Error(
    'FIREBASE_SERVICE_ACCOUNT_JSON is not valid JSON or base64-encoded service-account JSON'
  );
};

const readServiceAccountFile = () => {
  const filePath = String(env.GOOGLE_APPLICATION_CREDENTIALS || '').trim();
  if (!filePath) return null;
  if (!fs.existsSync(filePath)) {
    throw new Error(`Firebase service-account file not found: ${filePath}`);
  }
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
};

const buildFirebaseApp = () => {
  if (getApps().length > 0) return getApps()[0];

  const serviceAccount = parseServiceAccountJson() || readServiceAccountFile();
  const projectId =
    env.FIREBASE_PROJECT_ID || serviceAccount?.project_id || undefined;

  if (serviceAccount) {
    return initializeApp({
      credential: cert(serviceAccount),
      projectId,
    });
  }

  // The Auth emulator only needs a project id, not a service account.
  if (env.FIREBASE_AUTH_EMULATOR_HOST && projectId) {
    return initializeApp({ projectId });
  }

  return null;
};

let firebaseApp;
let initializationError;

const getFirebaseApp = () => {
  if (firebaseApp) return firebaseApp;
  if (initializationError) throw initializationError;

  try {
    firebaseApp = buildFirebaseApp();
    return firebaseApp;
  } catch (error) {
    initializationError = error;
    throw error;
  }
};

const isFirebaseConfigured = () => {
  try {
    return Boolean(getFirebaseApp());
  } catch {
    return false;
  }
};

const getMessaging = () => {
  const app = getFirebaseApp();
  if (!app) throw new Error('Firebase Cloud Messaging is not configured');
  return getAdminMessaging(app);
};

const getAuth = () => {
  const app = getFirebaseApp();
  if (!app) throw new Error('Firebase Authentication is not configured');
  return getAdminAuth(app);
};

const verifyIdToken = (token) => getAuth().verifyIdToken(token);

module.exports = {
  getFirebaseApp,
  isFirebaseConfigured,
  getMessaging,
  getAuth,
  verifyIdToken,
};
