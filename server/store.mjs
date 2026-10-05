// Durable task storage (SQLite via Node's built-in node:sqlite).
//
// - The demo fixture is seeded only into an EMPTY database; startup never
//   overwrites saved changes. Resetting is a separate, explicit step (reset.mjs).
// - A move updates the task and renumbers both affected lanes in ONE
//   transaction, so a partial update cannot leave inconsistent ordering.
// - Every move carries a client operation id. Re-sending the same id returns
//   the already-committed result instead of applying the move again, so a
//   retry after a lost response cannot duplicate or corrupt the change.

import {DatabaseSync} from 'node:sqlite';
import {mkdirSync} from 'node:fs';
import path from 'node:path';
import {FIXTURE_TASKS} from './fixture.mjs';

export const LANES = [1, 2, 3];
const OPERATION_ID = /^[A-Za-z0-9-]{8,64}$/;

export class StoreError extends Error {
  constructor(status, code, message) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

const SCHEMA = `
  CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY,
    task_name TEXT NOT NULL,
    description TEXT,
    assignee TEXT,
    due_date TEXT,
    tags TEXT NOT NULL DEFAULT '[]',
    priority_level TEXT,
    swim_lane INTEGER NOT NULL CHECK (swim_lane IN (1, 2, 3)),
    priority INTEGER NOT NULL CHECK (priority >= 1)
  );
  CREATE TABLE IF NOT EXISTS operations (
    id TEXT PRIMARY KEY,
    task_id INTEGER NOT NULL,
    to_lane INTEGER NOT NULL,
    revision INTEGER NOT NULL,
    applied_at TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS meta (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
  );
`;

const toTask = (row) => ({
  id: row.id,
  taskName: row.task_name,
  swimLane: row.swim_lane,
  priority: row.priority,
  description: row.description ?? undefined,
  assignee: row.assignee ?? undefined,
  dueDate: row.due_date ?? undefined,
  tags: JSON.parse(row.tags),
  priorityLevel: row.priority_level ?? undefined,
});

export const openStore = (dbPath) => {
  mkdirSync(path.dirname(dbPath), {recursive: true});
  const db = new DatabaseSync(dbPath);
  db.exec('PRAGMA journal_mode = WAL; PRAGMA synchronous = FULL; PRAGMA busy_timeout = 5000;');
  db.exec(SCHEMA);

  const transaction = (fn) => {
    db.exec('BEGIN IMMEDIATE');
    try {
      const result = fn();
      db.exec('COMMIT');
      return result;
    } catch (error) {
      db.exec('ROLLBACK');
      throw error;
    }
  };

  const insertFixture = () => {
    const insert = db.prepare(`INSERT INTO tasks
      (id, task_name, description, assignee, due_date, tags, priority_level, swim_lane, priority)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`);
    for (const t of FIXTURE_TASKS) {
      insert.run(t.id, t.taskName, t.description, t.assignee, t.dueDate, JSON.stringify(t.tags), t.priorityLevel, t.swimLane, t.priority);
    }
    db.prepare("INSERT OR REPLACE INTO meta (key, value) VALUES ('revision', '0')").run();
  };

  const revision = () => Number(db.prepare("SELECT value FROM meta WHERE key = 'revision'").get()?.value ?? 0);

  // Seed only when the database has never held tasks.
  const seeded = transaction(() => {
    if (db.prepare('SELECT COUNT(*) AS n FROM tasks').get().n > 0) return false;
    insertFixture();
    return true;
  });

  const getBoard = () => ({
    revision: revision(),
    tasks: db.prepare('SELECT * FROM tasks ORDER BY swim_lane, priority, id').all().map(toTask),
  });

  const moveTask = ({operationId, taskId, toLane}) => {
    if (typeof operationId !== 'string' || !OPERATION_ID.test(operationId)) {
      throw new StoreError(400, 'invalid_operation_id', 'The request is missing a valid operation id.');
    }
    if (!Number.isInteger(taskId) || taskId < 0) {
      throw new StoreError(400, 'invalid_task_id', 'The task id is not valid.');
    }
    if (!LANES.includes(toLane)) {
      throw new StoreError(400, 'invalid_lane', 'The destination lane is not valid.');
    }

    return transaction(() => {
      const previous = db.prepare('SELECT * FROM operations WHERE id = ?').get(operationId);
      if (previous) {
        if (previous.task_id !== taskId || previous.to_lane !== toLane) {
          throw new StoreError(409, 'operation_conflict', 'This operation id was already used for a different change.');
        }
        return {...getBoard(), operation: {id: operationId, applied: true, replayed: true}};
      }

      const task = db.prepare('SELECT id, swim_lane FROM tasks WHERE id = ?').get(taskId);
      if (!task) throw new StoreError(404, 'task_not_found', 'That task no longer exists.');
      if (task.swim_lane === toLane) {
        throw new StoreError(409, 'already_in_lane', 'The task is already in that lane.');
      }

      // Moved task goes to the top of the destination lane; both lanes are
      // renumbered 1..n in their existing order (deterministic: priority, id).
      const laneIds = (lane) =>
        db.prepare('SELECT id FROM tasks WHERE swim_lane = ? AND id != ? ORDER BY priority, id').all(lane, taskId).map((r) => r.id);
      const update = db.prepare('UPDATE tasks SET swim_lane = ?, priority = ? WHERE id = ?');
      [taskId, ...laneIds(toLane)].forEach((id, i) => update.run(toLane, i + 1, id));
      laneIds(task.swim_lane).forEach((id, i) => update.run(task.swim_lane, i + 1, id));

      const next = revision() + 1;
      db.prepare("UPDATE meta SET value = ? WHERE key = 'revision'").run(String(next));
      db.prepare('INSERT INTO operations (id, task_id, to_lane, revision, applied_at) VALUES (?, ?, ?, ?, ?)')
        .run(operationId, taskId, toLane, next, new Date().toISOString());
      return {...getBoard(), operation: {id: operationId, applied: true, replayed: false}};
    });
  };

  const getOperation = (operationId) => {
    if (typeof operationId !== 'string' || !OPERATION_ID.test(operationId)) {
      throw new StoreError(400, 'invalid_operation_id', 'The operation id is not valid.');
    }
    const row = db.prepare('SELECT id FROM operations WHERE id = ?').get(operationId);
    return {...getBoard(), operation: {id: operationId, applied: Boolean(row)}};
  };

  // Explicit reset to the synthetic fixture - only called by reset.mjs and tests.
  const resetToFixture = () =>
    transaction(() => {
      db.exec('DELETE FROM tasks; DELETE FROM operations;');
      insertFixture();
    });

  return {seeded, getBoard, moveTask, getOperation, resetToFixture, close: () => db.close()};
};
