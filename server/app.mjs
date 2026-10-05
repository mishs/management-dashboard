// HTTP API for the task board (plus optional static hosting of the built UI).
//
//   GET  /api/health
//   GET  /api/tasks                   -> {revision, tasks}
//   POST /api/tasks/:id/move          {operationId, toLane} -> {revision, tasks, operation}
//   GET  /api/operations/:id          -> {revision, tasks, operation: {applied}}
//
// Errors are JSON: {error: {code, message}} with a plain-language message.

import {createServer} from 'node:http';
import {readFile, stat} from 'node:fs/promises';
import path from 'node:path';
import {StoreError} from './store.mjs';

const MAX_BODY_BYTES = 4 * 1024;
const MIME = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.ico': 'image/x-icon', '.woff2': 'font/woff2',
};

const send = (res, status, body) => {
  res.writeHead(status, {'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store'});
  res.end(JSON.stringify(body));
};
const fail = (res, status, code, message) => send(res, status, {error: {code, message}});

const readJson = (req) =>
  new Promise((resolve, reject) => {
    if (!/^application\/json\b/.test(req.headers['content-type'] ?? '')) {
      reject(new StoreError(415, 'unsupported_media_type', 'The request must be sent as JSON.'));
      return;
    }
    let size = 0;
    const chunks = [];
    req.on('data', (chunk) => {
      size += chunk.length;
      // Keep reading (and discarding) so the client still receives the 413 answer.
      if (size <= MAX_BODY_BYTES) chunks.push(chunk);
    });
    req.on('end', () => {
      if (size > MAX_BODY_BYTES) {
        reject(new StoreError(413, 'body_too_large', 'The request is too large.'));
        return;
      }
      try {
        const body = JSON.parse(Buffer.concat(chunks).toString('utf8'));
        if (!body || typeof body !== 'object' || Array.isArray(body)) throw new Error('not an object');
        resolve(body);
      } catch {
        reject(new StoreError(400, 'invalid_json', 'The request body is not valid JSON.'));
      }
    });
    req.on('error', reject);
  });

const serveStatic = async (res, staticDir, urlPath) => {
  const root = path.resolve(staticDir);
  let file = path.resolve(root, `.${decodeURIComponent(urlPath)}`);
  if (!file.startsWith(root + path.sep) && file !== root) return fail(res, 404, 'not_found', 'Not found.');
  const isFile = await stat(file).then((s) => s.isFile(), () => false);
  if (!isFile) file = path.join(root, 'index.html'); // single-page app fallback
  const body = await readFile(file).catch(() => null);
  if (!body) return fail(res, 404, 'not_found', 'Not found.');
  res.writeHead(200, {'Content-Type': MIME[path.extname(file)] ?? 'application/octet-stream'});
  res.end(body);
};

export const createApp = ({store, staticDir = null, log = () => {}}) =>
  createServer(async (req, res) => {
    const url = new URL(req.url ?? '/', 'http://localhost');
    const {pathname} = url;
    try {
      if (pathname === '/api/health' && req.method === 'GET') return send(res, 200, {ok: true});

      if (pathname === '/api/tasks') {
        if (req.method !== 'GET') return fail(res, 405, 'method_not_allowed', 'That action is not supported.');
        return send(res, 200, store.getBoard());
      }

      const move = pathname.match(/^\/api\/tasks\/([^/]+)\/move$/);
      if (move) {
        if (req.method !== 'POST') return fail(res, 405, 'method_not_allowed', 'That action is not supported.');
        if (!/^\d{1,9}$/.test(move[1])) return fail(res, 400, 'invalid_task_id', 'The task id is not valid.');
        const body = await readJson(req);
        const result = store.moveTask({operationId: body.operationId, taskId: Number(move[1]), toLane: body.toLane});
        log(`move task ${move[1]} -> lane ${body.toLane} (${result.operation.replayed ? 'replayed' : `revision ${result.revision}`})`);
        return send(res, 200, result);
      }

      const op = pathname.match(/^\/api\/operations\/([^/]+)$/);
      if (op) {
        if (req.method !== 'GET') return fail(res, 405, 'method_not_allowed', 'That action is not supported.');
        return send(res, 200, store.getOperation(op[1]));
      }

      if (pathname.startsWith('/api/')) return fail(res, 404, 'not_found', 'Not found.');
      if (staticDir && (req.method === 'GET' || req.method === 'HEAD')) return serveStatic(res, staticDir, pathname);
      return fail(res, 404, 'not_found', 'Not found.');
    } catch (error) {
      if (error instanceof StoreError) return fail(res, error.status, error.code, error.message);
      log(`unexpected error: ${error?.stack ?? error}`);
      return fail(res, 500, 'server_error', 'Something went wrong on the server.');
    }
  });
