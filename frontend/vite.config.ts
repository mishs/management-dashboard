import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  build: {
    // Optimize chunk loading for better reliability
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