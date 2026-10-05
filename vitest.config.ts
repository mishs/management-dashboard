import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

const src = path.resolve(__dirname, './frontend/src');

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./frontend/src/test/setup.ts'],
    // Unit tests only; browser tests live in frontend/e2e and run with Playwright (npm run test:e2e).
    include: ['frontend/src/**/*.test.{ts,tsx}', 'server/**/*.test.mjs'],
  },
  resolve: {
    alias: {
      '@': src,
      '@store': path.join(src, 'store'),
      '@theme': path.join(src, 'theme'),
      '@components': path.join(src, 'components'),
      '@storybookComponents': path.join(src, 'storybookComponents'),
      '@types': path.join(src, 'types'),
      '@utils': path.join(src, 'utils'),
      '@hooks': path.join(src, 'hooks'),
    },
  },
});
