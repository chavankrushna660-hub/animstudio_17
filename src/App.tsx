import { useEffect } from 'react';
import AnimStudioClient from './anim/AnimStudioClient';

export default function App() {
  useEffect(() => {
    // Register Service Worker for PWA
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').catch((err) => {
          console.warn('Service Worker registration note:', err);
        });
      });
    }
  }, []);

  return <AnimStudioClient />;
}
