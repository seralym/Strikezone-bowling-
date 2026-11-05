import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { registerSW } from 'virtual:pwa-register';

// Register PWA service worker for offline support and updates
registerSW({ immediate: true });

// Prevent unhandled page reloads / empty anchor clicks in preview environment
if (typeof window !== 'undefined') {
  window.addEventListener(
    'submit',
    (e) => {
      e.preventDefault();
    },
    false
  );

  document.addEventListener(
    'click',
    (e) => {
      const target = e.target as HTMLElement | null;
      const anchor = target?.closest('a');
      if (anchor) {
        const href = anchor.getAttribute('href');
        if (!href || href === '#' || href.startsWith('javascript:')) {
          e.preventDefault();
        }
      }
    },
    false
  );
}

createRoot(document.getElementById('root')!).render(<App />);
