import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Register basic Service Worker for PWA installability & offline support
if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js', { scope: '/' }).catch(() => {
      // Fallback handled by vite-plugin-pwa or dev environment
    });
  });
}

createRoot(document.getElementById('root')!).render(<App />);
