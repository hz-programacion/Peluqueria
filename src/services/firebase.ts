import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import {
  getAuth,
  Auth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import {
  getFirestore,
  Firestore,
  doc,
  setDoc,
  deleteDoc,
  getDocFromServer,
  collection,
  onSnapshot,
  Unsubscribe,
} from 'firebase/firestore';
import appletFirebaseConfig from '../../firebase-applet-config.json';
import type {
  AppointmentRecord,
  ClientFormulaNote,
  TransformationCaseRecord,
  StudioGalleryItem,
} from '../data/studioData';

const env = (import.meta as unknown as { env?: Record<string, string | undefined> }).env || {};

export const firebaseConfig = {
  apiKey: appletFirebaseConfig.apiKey || env.VITE_FIREBASE_API_KEY || '',
  authDomain: appletFirebaseConfig.authDomain || env.VITE_FIREBASE_AUTH_DOMAIN || '',
  projectId: appletFirebaseConfig.projectId || env.VITE_FIREBASE_PROJECT_ID || '',
  storageBucket: appletFirebaseConfig.storageBucket || env.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId:
    appletFirebaseConfig.messagingSenderId || env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: appletFirebaseConfig.appId || env.VITE_FIREBASE_APP_ID || '',
  firestoreDatabaseId:
    appletFirebaseConfig.firestoreDatabaseId || env.VITE_FIREBASE_DATABASE_ID || '(default)',
};

export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey &&
    firebaseConfig.apiKey !== 'YOUR_FIREBASE_API_KEY' &&
    firebaseConfig.projectId &&
    firebaseConfig.projectId !== 'remixed-project-id'
);

export const app: FirebaseApp | null = (() => {
  if (!isFirebaseConfigured) return null;
  try {
    return getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
  } catch {
    return null;
  }
})();

export const db: Firestore | null = (() => {
  if (!app) return null;
  try {
    return getFirestore(app, firebaseConfig.firestoreDatabaseId);
  } catch {
    try {
      return getFirestore(app);
    } catch {
      return null;
    }
  }
})();

export const auth: Auth | null = (() => {
  if (!app) return null;
  try {
    return getAuth(app);
  } catch {
    return null;
  }
})();

export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const currentUser = auth?.currentUser;
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: currentUser?.uid ?? null,
      email: currentUser?.email ?? null,
      emailVerified: currentUser?.emailVerified ?? null,
      isAnonymous: currentUser?.isAnonymous ?? null,
      tenantId: currentUser?.tenantId ?? null,
      providerInfo:
        currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export interface StudioUserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: 'admin' | 'client';
  studioName?: string;
  updatedAt: string;
}

const ADMIN_EMAILS = ['hz.mdiego@gmail.com'];

let connectionTested = false;

/**
 * Validates connection to Firestore on application boot using getDocFromServer.
 */
export async function testFirestoreConnection(): Promise<boolean> {
  if (!db || typeof window === 'undefined') return false;
  if (connectionTested) return true;
  connectionTested = true;
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Please check your Firebase configuration.');
      return false;
    }
    return true;
  }
}

if (typeof window !== 'undefined' && db) {
  testFirestoreConnection().catch(() => {});
}

// ============================================================================
// AUTHENTICATION & USER PROFILES (/studio_users/{userId})
// ============================================================================

export async function upsertStudioUserProfile(
  user: User,
  studioName = 'Rodrigo Cutsss'
): Promise<StudioUserProfile | null> {
  if (!db || !user.email) return null;
  const isStudioAdmin = ADMIN_EMAILS.includes(user.email.toLowerCase());
  const profile: StudioUserProfile = {
    uid: user.uid,
    email: user.email.slice(0, 160),
    displayName: (user.displayName || user.email.split('@')[0] || 'Rodrigo').slice(0, 100),
    ...(user.photoURL ? { photoURL: user.photoURL.slice(0, 600) } : {}),
    role: isStudioAdmin ? 'admin' : 'client',
    studioName: studioName.slice(0, 120),
    updatedAt: new Date().toISOString().slice(0, 64),
  };

  const path = `studio_users/${user.uid}`;
  try {
    await setDoc(doc(db, 'studio_users', user.uid), profile, { merge: true });
    return profile;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function signInStudioWithGoogle(
  studioName = 'Rodrigo Cutsss'
): Promise<{ user: User; profile: StudioUserProfile | null }> {
  if (!auth) {
    throw new Error('Firebase Auth no está inicializado.');
  }
  const result = await signInWithPopup(auth, googleProvider);
  let profile: StudioUserProfile | null = null;
  try {
    profile = await upsertStudioUserProfile(result.user, studioName);
  } catch {
    // Profile write is optional if user email is not verified yet
  }
  return { user: result.user, profile };
}

export async function signOutStudioUser(): Promise<void> {
  if (!auth) return;
  await signOut(auth);
}

export function subscribeToAuthChanges(callback: (user: User | null) => void): Unsubscribe {
  if (!auth) {
    callback(null);
    return () => {};
  }
  return onAuthStateChanged(auth, callback);
}

// ============================================================================
// REAL-TIME FIRESTORE SYNC: APPOINTMENTS (/studio_appointments/{id})
// ============================================================================

function sanitizeFirestoreId(rawId: string): string {
  const cleaned = rawId.replace(/[^a-zA-Z0-9_-]/g, '-').slice(0, 120);
  return cleaned.length >= 2 ? cleaned : `id-${Date.now()}`;
}

export async function syncAppointmentToFirestore(appointment: AppointmentRecord): Promise<void> {
  if (!db) return;
  const docId = sanitizeFirestoreId(appointment.id);
  const path = `studio_appointments/${docId}`;
  const payload = {
    id: docId,
    date: String(appointment.date || '').slice(0, 10),
    startTime: String(appointment.startTime || '').slice(0, 5),
    serviceMinutes: Math.min(360, Math.max(10, Number(appointment.serviceMinutes) || 45)),
    bufferMinutes: Math.min(60, Math.max(0, Number(appointment.bufferMinutes) || 10)),
    clientName: String(appointment.clientName || 'Cliente').trim().slice(0, 80),
    whatsapp: String(appointment.whatsapp || '').trim().slice(0, 32),
    serviceNames: (appointment.serviceNames || ['Corte de Autor / Clásico'])
      .slice(0, 6)
      .map((s) => String(s).slice(0, 120)),
    paymentOption: ['deposit', 'full', 'studio', 'commitment'].includes(appointment.paymentOption)
      ? appointment.paymentOption
      : 'deposit',
    status: ['pending', 'confirmed', 'completed', 'cancelled'].includes(appointment.status)
      ? appointment.status
      : 'confirmed',
    ...(appointment.reviewLoopScheduledAt
      ? { reviewLoopScheduledAt: String(appointment.reviewLoopScheduledAt).slice(0, 32) }
      : {}),
  };

  try {
    await setDoc(doc(db, 'studio_appointments', docId), payload);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteAppointmentFromFirestore(id: string): Promise<void> {
  if (!db) return;
  const docId = sanitizeFirestoreId(id);
  const path = `studio_appointments/${docId}`;
  try {
    await deleteDoc(doc(db, 'studio_appointments', docId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export function subscribeToFirestoreAppointments(
  onUpdate: (appointments: AppointmentRecord[]) => void
): Unsubscribe {
  if (!db || typeof window === 'undefined') return () => {};
  const path = 'studio_appointments';
  return onSnapshot(
    collection(db, path),
    (snapshot) => {
      const items: AppointmentRecord[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data() as AppointmentRecord;
        if (data && data.id && data.date && data.startTime) {
          items.push(data);
        }
      });
      onUpdate(items);
    },
    (error) => {
      try {
        handleFirestoreError(error, OperationType.LIST, path);
      } catch {
        // Logged via handleFirestoreError
      }
    }
  );
}

// ============================================================================
// REAL-TIME FIRESTORE SYNC: TRANSFORMATIONS (/studio_transformations/{id})
// ============================================================================

export async function syncTransformationToFirestore(
  item: TransformationCaseRecord
): Promise<void> {
  if (!db) return;
  const docId = sanitizeFirestoreId(item.id);
  const path = `studio_transformations/${docId}`;
  const payload: TransformationCaseRecord = {
    id: docId,
    title: String(item.title || 'Transformación').slice(0, 140),
    shortTabTitle: String(item.shortTabTitle || item.title || 'Cambio').slice(0, 60),
    tag: String(item.tag || 'CAMBIO DE ESTRUCTURA').slice(0, 80),
    serviceId: String(item.serviceId || 'srv-01').slice(0, 64),
    priceDisplay: String(item.priceDisplay || '$12.000 ARS').slice(0, 40),
    duration: String(item.duration || '45 min').slice(0, 40),
    idealFor: String(item.idealFor || 'Todo tipo de cabello').slice(0, 240),
    beforeLabel: String(item.beforeLabel || 'ANTES').slice(0, 80),
    beforeDetail: String(item.beforeDetail || 'Diagnóstico inicial').slice(0, 300),
    afterLabel: String(item.afterLabel || 'DESPUÉS').slice(0, 80),
    afterDetail: String(item.afterDetail || 'Resultado terminado').slice(0, 300),
    beforeImage: String(item.beforeImage || '').slice(0, 440000),
    afterImage: String(item.afterImage || '').slice(0, 440000),
    formulaSteps: (item.formulaSteps || ['Diagnóstico y ejecución técnica'])
      .slice(0, 6)
      .map((s) => String(s).slice(0, 160)),
  };

  try {
    await setDoc(doc(db, 'studio_transformations', docId), payload);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteTransformationFromFirestore(id: string): Promise<void> {
  if (!db) return;
  const docId = sanitizeFirestoreId(id);
  const path = `studio_transformations/${docId}`;
  try {
    await deleteDoc(doc(db, 'studio_transformations', docId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export function subscribeToFirestoreTransformations(
  onUpdate: (items: TransformationCaseRecord[]) => void
): Unsubscribe {
  if (!db || typeof window === 'undefined') return () => {};
  const path = 'studio_transformations';
  return onSnapshot(
    collection(db, path),
    (snapshot) => {
      const items: TransformationCaseRecord[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data() as TransformationCaseRecord;
        if (data && data.id && data.beforeImage && data.afterImage) {
          items.push(data);
        }
      });
      if (items.length > 0) {
        onUpdate(items);
      }
    },
    (error) => {
      try {
        handleFirestoreError(error, OperationType.LIST, path);
      } catch {
        // Logged via handleFirestoreError
      }
    }
  );
}

// ============================================================================
// REAL-TIME FIRESTORE SYNC: CRM CLIENT NOTES (/studio_crm_notes/{id})
// ============================================================================

export async function syncCrmNoteToFirestore(note: ClientFormulaNote): Promise<void> {
  if (!db || !auth?.currentUser) return;
  const docId = sanitizeFirestoreId(note.id);
  const path = `studio_crm_notes/${docId}`;
  const payload: ClientFormulaNote = {
    id: docId,
    clientName: String(note.clientName || 'Cliente').slice(0, 80),
    whatsapp: String(note.whatsapp || '').slice(0, 32),
    formulaSpec: String(note.formulaSpec || '').slice(0, 600),
    hairType: String(note.hairType || 'Normal').slice(0, 200),
    preferredProducts: String(note.preferredProducts || 'Polvo mate').slice(0, 200),
    updatedAt: String(note.updatedAt || new Date().toISOString().slice(0, 10)).slice(0, 64),
  };

  try {
    await setDoc(doc(db, 'studio_crm_notes', docId), payload);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteCrmNoteFromFirestore(id: string): Promise<void> {
  if (!db || !auth?.currentUser) return;
  const docId = sanitizeFirestoreId(id);
  const path = `studio_crm_notes/${docId}`;
  try {
    await deleteDoc(doc(db, 'studio_crm_notes', docId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export function subscribeToFirestoreCrmNotes(
  onUpdate: (notes: ClientFormulaNote[]) => void
): Unsubscribe {
  if (!db || !auth?.currentUser || typeof window === 'undefined') return () => {};
  const path = 'studio_crm_notes';
  return onSnapshot(
    collection(db, path),
    (snapshot) => {
      const notes: ClientFormulaNote[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data() as ClientFormulaNote;
        if (data && data.id && data.clientName) {
          notes.push(data);
        }
      });
      if (notes.length > 0) {
        onUpdate(notes);
      }
    },
    (error) => {
      try {
        handleFirestoreError(error, OperationType.LIST, path);
      } catch {
        // Logged via handleFirestoreError
      }
    }
  );
}

// ============================================================================
// REAL-TIME FIRESTORE SYNC: GALLERY (/studio_gallery/{id})
// ============================================================================

export async function syncGalleryItemToFirestore(item: StudioGalleryItem): Promise<void> {
  if (!db) return;
  const docId = sanitizeFirestoreId(item.id);
  const path = `studio_gallery/${docId}`;
  const payload = {
    id: docId,
    title: String(item.title || 'Trabajo en estudio').slice(0, 120),
    category: String(item.category || 'Cortes & Fades').slice(0, 60),
    imageUrl: String(item.imageUrl || '').slice(0, 440000),
    description: String(item.description || '').slice(0, 400),
    dateLabel: String(item.dateLabel || 'Reciente').slice(0, 60),
    likes: Math.max(0, Number(item.likes) || 1),
  };

  try {
    await setDoc(doc(db, 'studio_gallery', docId), payload, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteGalleryItemFromFirestore(id: string): Promise<void> {
  if (!db) return;
  const docId = sanitizeFirestoreId(id);
  const path = `studio_gallery/${docId}`;
  try {
    await deleteDoc(doc(db, 'studio_gallery', docId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}
