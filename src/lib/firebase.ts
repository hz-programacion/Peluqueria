/**
 * Re-exports Firebase services from src/services/firebase.ts.
 * Environment variable fallback (VITE_FIREBASE_API_KEY) is supported without hardcoding secrets.
 */
export {
  firebaseConfig,
  isFirebaseConfigured,
  app,
  db,
  auth,
  googleProvider,
  OperationType,
  handleFirestoreError,
  testFirestoreConnection,
  signInStudioWithGoogle,
  signOutStudioUser,
  subscribeToAuthChanges,
} from '../services/firebase';
