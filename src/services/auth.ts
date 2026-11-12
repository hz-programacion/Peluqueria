import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  setPersistence,
  browserLocalPersistence,
  updateProfile,
  User,
  Unsubscribe,
} from 'firebase/auth';
import {
  auth,
  googleProvider,
  upsertStudioUserProfile,
  StudioUserProfile,
} from './firebase';

const AUTH_SESSION_STORAGE_KEY = 'rodrigo_cutsss_persistent_auth_v1';

export interface PersistentAuthSession {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  emailVerified: boolean;
  providerId: string;
  lastAuthenticatedAt: string;
}

function saveSessionSnapshot(user: User | null): PersistentAuthSession | null {
  if (typeof window === 'undefined') return null;
  if (!user) {
    try {
      localStorage.removeItem(AUTH_SESSION_STORAGE_KEY);
    } catch {
      // ignore storage errors
    }
    return null;
  }

  const snapshot: PersistentAuthSession = {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName || user.email?.split('@')[0] || 'Rodrigo',
    photoURL: user.photoURL,
    emailVerified: user.emailVerified,
    providerId: user.providerData?.[0]?.providerId || 'password',
    lastAuthenticatedAt: new Date().toISOString(),
  };

  try {
    localStorage.setItem(AUTH_SESSION_STORAGE_KEY, JSON.stringify(snapshot));
  } catch {
    // ignore storage errors
  }
  return snapshot;
}

/**
 * Returns the cached persistent session snapshot immediately on boot
 * before Firebase's async token refresh completes.
 */
export function getCachedAuthSession(): PersistentAuthSession | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(AUTH_SESSION_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PersistentAuthSession;
    return parsed && parsed.uid ? parsed : null;
  } catch {
    return null;
  }
}

/**
 * Ensures Firebase Auth uses browserLocalPersistence so the barber/admin
 * stays signed in across browser restarts and tab reloads.
 */
export async function ensureAuthPersistence(): Promise<void> {
  if (!auth || typeof window === 'undefined') return;
  try {
    await setPersistence(auth, browserLocalPersistence);
  } catch {
    // Fallback to default persistence if blocked by browser privacy mode
  }
}

/**
 * Sign in with Email and Password using Firebase Authentication.
 */
export async function signInWithEmail(
  email: string,
  password: string,
  studioName = 'Rodrigo Cutsss'
): Promise<{
  user: User;
  session: PersistentAuthSession | null;
  profile: StudioUserProfile | null;
}> {
  if (!auth) {
    throw new Error('Firebase Auth no está inicializado.');
  }
  await ensureAuthPersistence();
  const credential = await signInWithEmailAndPassword(auth, email.trim(), password);
  const session = saveSessionSnapshot(credential.user);
  let profile: StudioUserProfile | null = null;
  try {
    profile = await upsertStudioUserProfile(credential.user, studioName);
  } catch {
    // Profile upsert is best-effort if email is not verified yet
  }
  return { user: credential.user, session, profile };
}

/**
 * Register a new account with Email and Password in Firebase Authentication.
 */
export async function registerWithEmail(
  email: string,
  password: string,
  displayName = 'Rodrigo',
  studioName = 'Rodrigo Cutsss'
): Promise<{
  user: User;
  session: PersistentAuthSession | null;
  profile: StudioUserProfile | null;
}> {
  if (!auth) {
    throw new Error('Firebase Auth no está inicializado.');
  }
  await ensureAuthPersistence();
  const credential = await createUserWithEmailAndPassword(auth, email.trim(), password);
  if (displayName.trim()) {
    try {
      await updateProfile(credential.user, { displayName: displayName.trim() });
    } catch {
      // Optional display name update
    }
  }
  const session = saveSessionSnapshot(credential.user);
  let profile: StudioUserProfile | null = null;
  try {
    profile = await upsertStudioUserProfile(credential.user, studioName);
  } catch {
    // Optional profile write
  }
  return { user: credential.user, session, profile };
}

/**
 * Sends a password reset email via Firebase Auth.
 */
export async function sendAdminPasswordReset(email: string): Promise<void> {
  if (!auth) {
    throw new Error('Firebase Auth no está inicializado.');
  }
  await sendPasswordResetEmail(auth, email.trim());
}

/**
 * Sign in with Google OAuth Popup with persistent local session.
 */
export async function signInWithGooglePopup(
  studioName = 'Rodrigo Cutsss'
): Promise<{
  user: User;
  session: PersistentAuthSession | null;
  profile: StudioUserProfile | null;
}> {
  if (!auth) {
    throw new Error('Firebase Auth no está inicializado.');
  }
  await ensureAuthPersistence();
  const result = await signInWithPopup(auth, googleProvider);
  const session = saveSessionSnapshot(result.user);
  let profile: StudioUserProfile | null = null;
  try {
    profile = await upsertStudioUserProfile(result.user, studioName);
  } catch {
    // Best-effort profile write
  }
  return { user: result.user, session, profile };
}

/**
 * Signs out the current Firebase user and clears the persistent session cache.
 */
export async function logoutPersistentSession(): Promise<void> {
  saveSessionSnapshot(null);
  if (!auth) return;
  await signOut(auth);
}

/**
 * Persistent User Session Handler:
 * Hydrates immediately from local cache if available, configures browserLocalPersistence,
 * and listens to live Firebase Auth state changes.
 */
export function initPersistentAuthSession(
  onSessionChange: (user: User | null, session: PersistentAuthSession | null) => void
): Unsubscribe {
  if (!auth) {
    onSessionChange(null, null);
    return () => {};
  }

  ensureAuthPersistence().catch(() => {});

  return onAuthStateChanged(auth, (user) => {
    const snapshot = saveSessionSnapshot(user);
    onSessionChange(user, snapshot);
  });
}
