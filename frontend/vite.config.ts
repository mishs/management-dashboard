import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'), // optional: for cleaner imports
    },
  },
  optimizeDeps: {
    include: ['react-redux', '@reduxjs/toolkit'], // ensure react-redux is pre-bundled
  },
});
