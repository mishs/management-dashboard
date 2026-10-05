import { spawn, execFileSync, type ChildProcess } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const API_PORT = 3101;
export const UI_PORT = 5174;
export const API_URL = `http://127.0.0.1:${API_PORT}/api`;

const here = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(here, '..', '..', '..');
/** Isolated test database - never the demo database. */
export const DB_PATH = path.resolve(here, '..', '.tmp', 'e2e.sqlite');

/** The real task API (server/index.mjs) on the test database. */
export class Backend {
  private proc: ChildProcess | null = null;

  async start(): Promise<void> {
    if (this.proc) return;
    const proc = spawn(process.execPath, ['--disable-warning=ExperimentalWarning', path.join(repoRoot, 'server', 'index.mjs')], {
      env: { ...process.env, PORT: String(API_PORT), HOST: '127.0.0.1', TASKS_DB_PATH: DB_PATH },
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    this.proc = proc;
    await new Promise<void>((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error('task API did not start')), 15_000);
      proc.stdout?.on('data', (chunk: Buffer) => {
        if (chunk.toString().includes('listening on')) {
          clearTimeout(timer);
          resolve();
        }
      });
      proc.on('exit', (code) => {
        clearTimeout(timer);
        reject(new Error(`task API exited early (code ${code})`));
      });
    });
  }

  async stop(): Promise<void> {
    const proc = this.proc;
    if (!proc) return;
    this.proc = null;
    await new Promise<void>((resolve) => {
      proc.once('exit', () => resolve());
      proc.kill('SIGTERM');
    });
  }
}

/** Explicit reset of the isolated test database (same script as `npm run db:reset:demo`). */
export const resetDatabase = () => {
  execFileSync(process.execPath, ['--disable-warning=ExperimentalWarning', path.join(repoRoot, 'server', 'reset.mjs'), '--db', DB_PATH, '--yes'], {
    stdio: 'ignore',
  });
};
