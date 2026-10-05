import type { LaneId, TaskWithSwimLane } from '../types';

const byPriority = (a: TaskWithSwimLane, b: TaskWithSwimLane) => a.priority - b.priority || a.id - b.id;

/**
 * Same rule the server applies (server/store.mjs): the moved task goes to the
 * top of the destination lane and both lanes are renumbered 1..n. Used only to
 * show a pending move; the server's response is what gets stored.
 */
export const applyMove = (tasks: TaskWithSwimLane[], taskId: number, toLane: LaneId): TaskWithSwimLane[] => {
  const moved = tasks.find((t) => t.id === taskId);
  if (!moved || moved.swimLane === toLane) return tasks;
  const target = tasks.filter((t) => t.swimLane === toLane && t.id !== taskId).sort(byPriority);
  const source = tasks.filter((t) => t.swimLane === moved.swimLane && t.id !== taskId).sort(byPriority);
  const updated = new Map<number, TaskWithSwimLane>();
  [moved, ...target].forEach((t, i) => updated.set(t.id, { ...t, swimLane: toLane, priority: i + 1 }));
  source.forEach((t, i) => updated.set(t.id, { ...t, priority: i + 1 }));
  return tasks.map((t) => updated.get(t.id) ?? t);
};

export const tasksInLane = (tasks: TaskWithSwimLane[], lane: LaneId) =>
  tasks.filter((t) => t.swimLane === lane).sort(byPriority);

/** Unique id for one intended move; re-sent unchanged on Retry so the server can de-duplicate. */
export const newOperationId = (): string => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') return crypto.randomUUID();
  const bytes = crypto.getRandomValues(new Uint8Array(16)); // randomUUID needs a secure context
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
};
