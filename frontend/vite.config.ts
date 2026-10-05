import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  // The task API (server/index.mjs) runs separately; the dev server forwards /api to it.
  server: {
    proxy: { '/api': process.env.API_PROXY_TARGET ?? 'http://127.0.0.1:3001' },
  },
  preview: {
    proxy: { '/api': process.env.API_PROXY_TARGET ?? 'http://127.0.0.1:3001' },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: undefined,
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@store': path.resolve(__dirname, 'src/store'),
      '@theme': path.resolve(__dirname, 'src/theme'),
      '@components': path.resolve(__dirname, 'src/components'),
      '@storybookComponents': path.resolve(__dirname, 'src/storybookComponents'),
      '@types': path.resolve(__dirname, 'src/types'),
      '@utils': path.resolve(__dirname, 'src/utils'),
      '@hooks': path.resolve(__dirname, 'src/hooks'),
    },
  },
});