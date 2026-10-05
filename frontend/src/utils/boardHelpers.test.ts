import { describe, expect, it } from 'vitest';
import { applyMove, newOperationId, tasksInLane } from './boardHelpers';
import type { TaskWithSwimLane } from '../types';

const t = (id: number, swimLane: 1 | 2 | 3, priority: number): TaskWithSwimLane => ({ id, taskName: `Task ${id}`, swimLane, priority });
const board = [t(0, 1, 1), t(1, 1, 2), t(2, 1, 3), t(5, 2, 1), t(6, 2, 2), t(7, 3, 1)];
const ids = (tasks: TaskWithSwimLane[], lane: 1 | 2 | 3) => tasksInLane(tasks, lane).map((x) => [x.id, x.priority]);

describe('applyMove (mirrors the server rule)', () => {
  it('puts the task at the top of the target lane and renumbers both lanes', () => {
    const next = applyMove(board, 0, 2);
    expect(ids(next, 1)).toEqual([[1, 1], [2, 2]]);
    expect(ids(next, 2)).toEqual([[0, 1], [5, 2], [6, 3]]);
    expect(ids(next, 3)).toEqual([[7, 1]]);
  });

  it('returns the same board for unknown tasks or same-lane moves', () => {
    expect(applyMove(board, 99, 2)).toBe(board);
    expect(applyMove(board, 5, 2)).toBe(board);
  });

  it('does not mutate the input', () => {
    const copy = structuredClone(board);
    applyMove(board, 0, 3);
    expect(board).toEqual(copy);
  });
});

describe('newOperationId', () => {
  it('produces distinct ids accepted by the server pattern', () => {
    const a = newOperationId();
    expect(a).toMatch(/^[A-Za-z0-9-]{8,64}$/);
    expect(newOperationId()).not.toBe(a);
  });
});
