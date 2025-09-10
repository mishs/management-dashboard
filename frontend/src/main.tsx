import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';

async function startApp() {
  // Start MSW only in development mode
  if (import.meta.env.DEV) {
    try {
      const { worker } = await import('./mocks/browser');
      await worker.start({
        onUnhandledRequest: 'bypass',
      });
      console.log('🚀 MSW started successfully');
    } catch (error) {
      console.error('❌ MSW failed to start:', error);
    }
  }

  // Render React app
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  );
}

startApp();
