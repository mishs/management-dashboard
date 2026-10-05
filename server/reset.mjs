// Explicitly resets an ISOLATED demo/test database to the synthetic fixture.
//
//   npm run db:reset:demo                      resets server/data/demo.sqlite
//   node server/reset.mjs --db <path> --yes    resets another demo/test database
//
// Guards: requires --yes, and only touches databases inside server/data/ or
// frontend/e2e/.tmp/ (the demo and test locations). It never runs on startup.

import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {openStore} from './store.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const ALLOWED_DIRS = [path.join(here, 'data'), path.resolve(here, '..', 'frontend', 'e2e', '.tmp')];

const args = process.argv.slice(2);
const dbArg = args.includes('--db') ? args[args.indexOf('--db') + 1] : null;
const dbPath = path.resolve(dbArg ?? path.join(here, 'data', 'demo.sqlite'));

if (!ALLOWED_DIRS.some((dir) => dbPath.startsWith(dir + path.sep))) {
  console.error(`Refusing to reset ${dbPath}: only demo/test databases in ${ALLOWED_DIRS.join(' or ')} can be reset.`);
  process.exit(1);
}
if (!args.includes('--yes')) {
  console.error(`This replaces ALL tasks in ${dbPath} with the synthetic demo data. Re-run with --yes to confirm.`);
  process.exit(1);
}

const store = openStore(dbPath);
store.resetToFixture();
const {tasks, revision} = store.getBoard();
store.close();
console.log(`Reset ${dbPath}: ${tasks.length} demo tasks, revision ${revision}.`);
