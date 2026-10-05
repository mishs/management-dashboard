// @vitest-environment node
import {afterEach, beforeEach, describe, expect, it} from 'vitest';
import {mkdtempSync, rmSync} from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {openStore, StoreError} from './store.mjs';

let dir;
let dbPath;
beforeEach(() => {
  dir = mkdtempSync(path.join(os.tmpdir(), 'tasks-store-'));
  dbPath = path.join(dir, 'test.sqlite');
});
afterEach(() => rmSync(dir, {recursive: true, force: true}));

const lane = (board, n) => board.tasks.filter((t) => t.swimLane === n).map((t) => [t.id, t.priority]);
const move = (store, taskId, toLane, operationId = `op-${taskId}-${toLane}-abc`) => store.moveTask({operationId, taskId, toLane});

describe('task store', () => {
  it('seeds the synthetic fixture into an empty database', () => {
    const store = openStore(dbPath);
    expect(store.seeded).toBe(true);
    const board = store.getBoard();
    expect(board.revision).toBe(0);
    expect(board.tasks).toHaveLength(9);
    expect(board.tasks.find((t) => t.id === 0)).toMatchObject({taskName: 'Design wireframes for dashboard', swimLane: 1, priority: 1});
    store.close();
  });

  it('moves a task to the top of the target lane and renumbers both lanes in one change', () => {
    const store = openStore(dbPath);
    const result = move(store, 0, 2);
    expect(result.revision).toBe(1);
    expect(result.operation).toEqual({id: 'op-0-2-abc', applied: true, replayed: false});
    expect(lane(result, 1)).toEqual([[1, 1], [2, 2], [3, 3], [4, 4]]);
    expect(lane(result, 2)).toEqual([[0, 1], [5, 2], [6, 3]]);
    expect(lane(result, 3)).toEqual([[7, 1], [8, 2]]);
    store.close();
  });

  it('keeps saved changes when the database is reopened, and never re-seeds over them', () => {
    let store = openStore(dbPath);
    move(store, 0, 2);
    store.close();
    store = openStore(dbPath);
    expect(store.seeded).toBe(false);
    const board = store.getBoard();
    expect(board.revision).toBe(1);
    expect(board.tasks.find((t) => t.id === 0)).toMatchObject({swimLane: 2, priority: 1});
    store.close();
  });

  it('applies a repeated operation id only once (safe retry after a lost response)', () => {
    const store = openStore(dbPath);
    const first = move(store, 0, 2, 'op-retry-1234');
    const again = move(store, 0, 2, 'op-retry-1234');
    expect(again.operation.replayed).toBe(true);
    expect(again.revision).toBe(first.revision);
    expect(lane(again, 2)).toEqual(lane(first, 2));
    expect(store.getOperation('op-retry-1234').operation.applied).toBe(true);
    expect(store.getOperation('op-unknown-1').operation.applied).toBe(false);
    store.close();
  });

  it('rejects invalid requests without changing stored data', () => {
    const store = openStore(dbPath);
    const before = store.getBoard();
    const cases = [
      [{operationId: 'op-valid-123', taskId: 0, toLane: 4}, 'invalid_lane'],
      [{operationId: 'op-valid-123', taskId: 0, toLane: '2'}, 'invalid_lane'],
      [{operationId: 'op-valid-123', taskId: 99, toLane: 2}, 'task_not_found'],
      [{operationId: 'op-valid-123', taskId: -1, toLane: 2}, 'invalid_task_id'],
      [{operationId: 'short', taskId: 0, toLane: 2}, 'invalid_operation_id'],
      [{operationId: undefined, taskId: 0, toLane: 2}, 'invalid_operation_id'],
      [{operationId: 'op-valid-123', taskId: 5, toLane: 2}, 'already_in_lane'],
    ];
    for (const [request, code] of cases) {
      expect(() => store.moveTask(request)).toThrow(StoreError);
      try {
        store.moveTask(request);
      } catch (error) {
        expect(error.code).toBe(code);
      }
    }
    expect(store.getBoard()).toEqual(before);
    store.close();
  });

  it('refuses to reuse an operation id for a different change', () => {
    const store = openStore(dbPath);
    move(store, 0, 2, 'op-shared-1234');
    const before = store.getBoard();
    expect(() => move(store, 1, 3, 'op-shared-1234')).toThrow(/different change/);
    expect(store.getBoard()).toEqual(before);
    store.close();
  });

  it('resets to the fixture only when explicitly asked', () => {
    const store = openStore(dbPath);
    move(store, 0, 2);
    store.resetToFixture();
    const board = store.getBoard();
    expect(board.revision).toBe(0);
    expect(board.tasks.find((t) => t.id === 0)).toMatchObject({swimLane: 1, priority: 1});
    expect(store.getOperation('op-0-2-abc').operation.applied).toBe(false);
    store.close();
  });
});
