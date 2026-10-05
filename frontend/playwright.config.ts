import { defineConfig, devices } from '@playwright/test';
import { API_PORT, UI_PORT } from './e2e/support/backend';

// Browser tests run against the REAL task API and an isolated SQLite file
// (frontend/e2e/.tmp/e2e.sqlite). The API process is started and restarted by
// the tests themselves (e2e/support/backend.ts) so persistence across a
// backend restart can be checked; Vite serves the UI and proxies /api to it.
export default defineConfig({
  testDir: './e2e',
  outputDir: './e2e/.tmp/test-results',
  // One shared backend and database: run tests one at a time.
  fullyParallel: false,
  workers: 1,
  use: {
    baseURL: `http://127.0.0.1:${UI_PORT}`,
    viewport: { width: 1920, height: 1080 },
    trace: 'retain-on-failure',
  },
  webServer: {
    command: `npx vite --port ${UI_PORT} --strictPort --host 127.0.0.1`,
    url: `http://127.0.0.1:${UI_PORT}`,
    env: { API_PROXY_TARGET: `http://127.0.0.1:${API_PORT}` },
    reuseExistingServer: false,
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1920, height: 1080 } },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'], viewport: { width: 1920, height: 1080 } },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'], viewport: { width: 1920, height: 1080 } },
    },
  ],
});
