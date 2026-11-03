import { GoogleSignin } from '@react-native-google-signin/google-signin';
import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithCredential,
  signInWithPopup,
  signOut as firebaseSignOut,
  type User as FirebaseUser,
} from 'firebase/auth';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { Platform } from 'react-native';

import { api } from '@/lib/api';
import { firebaseAuth } from '@/lib/firebase';

export type AlertUUser = {
  id: string;
  name: string;
  email: string;
  role: string;
  matric: string;
  accountStatus: string;
};

type ProfileResponse = {
  data: {
    id: string;
    name: string;
    email: string | null;
    role: string;
    accountStatus: string;
  };
};

type AuthContextValue = {
  user: AlertUUser | null;
  isInitializing: boolean;
  isSigningIn: boolean;
  authError: string | null;
  avatarUri: string | null;
  setAvatarUri: (uri: string | null) => void;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

const GOOGLE_WEB_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;

if (Platform.OS !== 'web' && GOOGLE_WEB_CLIENT_ID) {
  GoogleSignin.configure({
    webClientId: GOOGLE_WEB_CLIENT_ID,
    offlineAccess: false,
  });
}

const titleCaseRole = (role?: string | null) => {
  const value = (role || 'student').replace(/_/g, ' ');
  return value.charAt(0).toUpperCase() + value.slice(1);
};

const fallbackUser = (firebaseUser: FirebaseUser): AlertUUser => ({
  id: firebaseUser.uid,
  name:
    firebaseUser.displayName ||
    firebaseUser.email?.split('@')[0] ||
    'AlertU member',
  email: firebaseUser.email || '',
  role: 'Student',
  matric: '',
  accountStatus: 'active',
});

const profileUser = (
  profile: ProfileResponse['data'],
  firebaseUser: FirebaseUser
): AlertUUser => ({
  id: profile.id,
  name:
    profile.name ||
    firebaseUser.displayName ||
    firebaseUser.email?.split('@')[0] ||
    'AlertU member',
  email: profile.email || firebaseUser.email || '',
  role: titleCaseRole(profile.role),
  matric: '',
  accountStatus: profile.accountStatus || 'active',
});

const describeAuthError = (error: unknown) => {
  const code =
    typeof error === 'object' && error && 'code' in error
      ? String((error as { code?: string }).code || '')
      : '';
  const message = error instanceof Error ? error.message : '';

  if (
    code === 'auth/popup-closed-by-user' ||
    code === 'SIGN_IN_CANCELLED' ||
    code === '12501'
  ) {
    return null;
  }

  switch (code) {
    case 'auth/network-request-failed':
      return 'Network error. Check your internet connection and try again.';
    case 'auth/account-exists-with-different-credential':
      return 'This email is already linked to a different sign-in method.';
    case 'auth/operation-not-allowed':
      return 'Google sign-in is not enabled for this Firebase project yet.';
    case 'auth/invalid-api-key':
      return 'Firebase is not configured correctly. Check the Firebase API key.';
    case 'PLAY_SERVICES_NOT_AVAILABLE':
      return 'Google Play Services is unavailable or out of date on this device.';
    case 'DEVELOPER_ERROR':
      return 'Google Sign-In is misconfigured. Check the Android SHA-1 fingerprint and web client ID.';
    default:
      return message || 'Could not sign in with Google. Please try again.';
  }
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AlertUUser | null>(null);
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const unsubscribe = onAuthStateChanged(firebaseAuth, async (firebaseUser) => {
      if (!active) return;

      if (!firebaseUser) {
        setUser(null);
        setAvatarUri(null);
        setIsInitializing(false);
        return;
      }

      try {
        const response = await api<ProfileResponse>('/me');
        if (active) {
          setUser(profileUser(response.data, firebaseUser));
        }
      } catch (error) {
        // The Firebase session is still valid even if the API is unreachable.
        console.warn('[auth] Could not load the AlertU profile:', error);
        if (active) {
          setUser(fallbackUser(firebaseUser));
        }
      } finally {
        if (active) {
          setIsInitializing(false);
        }
      }
    });

    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  const signInWithGoogle = useCallback(async () => {
    setIsSigningIn(true);
    setAuthError(null);

    try {
      if (Platform.OS === 'web') {
        await signInWithPopup(firebaseAuth, new GoogleAuthProvider());
        return;
      }

      if (!GOOGLE_WEB_CLIENT_ID) {
        setAuthError(
          'Google sign-in is not configured yet. Add EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID to the app environment.'
        );
        return;
      }

      const playServicesAvailable = await GoogleSignin.hasPlayServices({
        showPlayServicesUpdateDialog: true,
      });

      if (!playServicesAvailable) {
        setAuthError('Google Play Services is required for Google sign-in.');
        return;
      }

      const response = await GoogleSignin.signIn();

      if (response.type !== 'success') {
        return;
      }

      const idToken = response.data.idToken;
      if (!idToken) {
        setAuthError(
          'Google did not return an ID token. Check the web client ID and Android SHA-1 configuration.'
        );
        return;
      }

      await signInWithCredential(
        firebaseAuth,
        GoogleAuthProvider.credential(idToken)
      );
    } catch (error) {
      const message = describeAuthError(error);
      if (message) {
        setAuthError(message);
      }
    } finally {
      setIsSigningIn(false);
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      if (Platform.OS !== 'web') {
        await GoogleSignin.signOut();
      }
    } catch {
      // Firebase sign-out should still proceed.
    }

    await firebaseSignOut(firebaseAuth);
    setUser(null);
    setAvatarUri(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isInitializing,
      isSigningIn,
      authError,
      avatarUri,
      setAvatarUri,
      signInWithGoogle,
      signOut,
    }),
    [
      user,
      isInitializing,
      isSigningIn,
      authError,
      avatarUri,
      signInWithGoogle,
      signOut,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return context;
}
