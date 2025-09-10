import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';

async function startApp() {
  if (import.meta.env.DEV) {
    try {
      const { worker } = await import('../mocks/browser.ts');
      await worker.start({
        onUnhandledRequest: 'bypass',
      });
      console.log('MSW started successfully');
    } catch (error) {
      console.warn('MSW failed to start:', error);
    }
  }

  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  );
}

startApp();