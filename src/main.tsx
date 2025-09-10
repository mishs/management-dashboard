import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Start the mock service worker
async function enableMocking() {
  if (typeof window !== 'undefined') {
    const { worker } = await import('../to-do-ndiroinopisa/backend/create-backend.ts');
    return worker.start();
  }
}

enableMocking().then(() => {
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  );
});