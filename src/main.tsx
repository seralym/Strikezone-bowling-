import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Prevent unwanted page reloads / form navigations in preview environment
if (typeof window !== 'undefined') {
  window.addEventListener(
    'submit',
    (e) => {
      e.preventDefault();
    },
    true
  );

  document.addEventListener(
    'click',
    (e) => {
      const target = e.target as HTMLElement | null;
      const button = target?.closest('button');
      if (button) {
        // Prevent default submission / navigation action on all buttons
        e.preventDefault();
      }
      const anchor = target?.closest('a');
      if (anchor) {
        const href = anchor.getAttribute('href');
        if (!href || href === '#' || href.startsWith('javascript:')) {
          e.preventDefault();
        }
      }
    },
    true
  );
}

createRoot(document.getElementById('root')!).render(<App />);
