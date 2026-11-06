import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAnalytics, isSupported, Analytics } from 'firebase/analytics';
import { getFirestore } from 'firebase/firestore';

export const firebaseConfig = {
  apiKey: "AIzaSyCk3j4_BXc6jg6DGmrWwCAZGge6zVkleZk",
  authDomain: "peluqueria-4817c.firebaseapp.com",
  projectId: "peluqueria-4817c",
  storageBucket: "peluqueria-4817c.firebasestorage.app",
  messagingSenderId: "748862779869",
  appId: "1:748862779869:web:226bcec353d0d09cfcc634",
  measurementId: "G-24HBE1R252"
};

// Initialize Firebase app singleton
export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const db = getFirestore(app);

// Safe Analytics initialization for browser context
export let analytics: Analytics | null = null;
if (typeof window !== 'undefined') {
  isSupported()
    .then((supported) => {
      if (supported) {
        analytics = getAnalytics(app);
      }
    })
    .catch(() => {
      // Graceful fallback
    });
}
