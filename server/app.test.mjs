// @vitest-environment node
import {afterAll, beforeAll, describe, expect, it} from 'vitest';
import {mkdtempSync, rmSync} from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {openStore} from './store.mjs';
import {createApp} from './app.mjs';

let dir, store, server, base;
beforeAll(async () => {
  dir = mkdtempSync(path.join(os.tmpdir(), 'tasks-api-'));
  store = openStore(path.join(dir, 'api.sqlite'));
  server = createApp({store});
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  base = `http://127.0.0.1:${server.address().port}/api`;
});
afterAll(() => {
  server.close();
  store.close();
  rmSync(dir, {recursive: true, force: true});
});

const post = (url, body, headers = {'Content-Type': 'application/json'}) =>
  fetch(base + url, {method: 'POST', headers, body: typeof body === 'string' ? body : JSON.stringify(body)});

describe('task API', () => {
  it('returns the board with a revision', async () => {
    const res = await fetch(`${base}/tasks`);
    expect(res.status).toBe(200);
    const board = await res.json();
    expect(board.revision).toBe(0);
    expect(board.tasks).toHaveLength(9);
  });

  it('rejects malformed or invalid move requests with plain messages and no change', async () => {
    const before = await (await fetch(`${base}/tasks`)).json();
    const cases = [
      [await post('/tasks/abc/move', {operationId: 'op-aaaaaaaa', toLane: 2}), 400, 'invalid_task_id'],
      [await post('/tasks/0/move', 'not json'), 400, 'invalid_json'],
      [await post('/tasks/0/move', [1, 2]), 400, 'invalid_json'],
      [await post('/tasks/0/move', {operationId: 'op-aaaaaaaa', toLane: 2}, {'Content-Type': 'text/plain'}), 415, 'unsupported_media_type'],
      [await post('/tasks/0/move', {operationId: 'op-aaaaaaaa', toLane: 9}), 400, 'invalid_lane'],
      [await post('/tasks/42/move', {operationId: 'op-aaaaaaaa', toLane: 2}), 404, 'task_not_found'],
      [await post('/tasks/0/move', {operationId: 'op-aaaaaaaa', toLane: 2, pad: 'x'.repeat(5000)}), 413, 'body_too_large'],
      [await fetch(`${base}/tasks`, {method: 'DELETE'}), 405, 'method_not_allowed'],
    ];
    for (const [res, status, code] of cases) {
      expect(res.status).toBe(status);
      const body = await res.json();
      expect(body.error.code).toBe(code);
      expect(body.error.message).toMatch(/^[A-Z][^{}]*\.$/); // a plain sentence, no raw exception
    }
    expect(await (await fetch(`${base}/tasks`)).json()).toEqual(before);
  });

  it('saves a move and reports it via the operation lookup', async () => {
    const res = await post('/tasks/0/move', {operationId: 'op-api-move-1', toLane: 2});
    expect(res.status).toBe(200);
    const saved = await res.json();
    expect(saved.operation).toMatchObject({applied: true, replayed: false});
    const check = await (await fetch(`${base}/operations/op-api-move-1`)).json();
    expect(check.operation.applied).toBe(true);
    expect(check.revision).toBe(saved.revision);
  });
});
