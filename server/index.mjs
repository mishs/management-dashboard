// Starts the task API on a local port, backed by a SQLite file.
//
//   npm run server                    API on http://localhost:3001
//   PORT=3101 TASKS_DB_PATH=/tmp/x.sqlite npm run server
//
// If frontend/dist exists (npm run build), the built UI is served too, so
// `npm run build && npm start` runs the whole app from one process.

import {existsSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {openStore} from './store.mjs';
import {createApp} from './app.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
export const DEFAULT_DB_PATH = path.join(here, 'data', 'demo.sqlite');

const port = Number(process.env.PORT ?? 3001);
const host = process.env.HOST ?? '127.0.0.1';
const dbPath = path.resolve(process.env.TASKS_DB_PATH ?? DEFAULT_DB_PATH);
const distDir = path.resolve(here, '..', 'frontend', 'dist');

const store = openStore(dbPath);
const log = (msg) => console.log(`[tasks-api] ${msg}`);
const server = createApp({store, staticDir: existsSync(distDir) ? distDir : null, log});

server.listen(port, host, () => {
  log(`listening on http://${host}:${port}`);
  log(`database: ${dbPath}${store.seeded ? ' (new - seeded with demo data)' : ' (existing data kept)'}`);
  if (existsSync(distDir)) log(`serving built UI from ${distDir}`);
});

const shutdown = () => {
  server.close();
  store.close();
  process.exit(0);
};
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
