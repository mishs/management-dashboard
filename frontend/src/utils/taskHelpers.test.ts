import { describe, it, expect } from 'vitest';
import { calculateAffectedTasks } from './taskHelpers';
import { TaskWithSwimLane } from '../types/index';

const mockTasks: { [key: number]: TaskWithSwimLane[] } = {
  1: [
    { id: 1, taskName: 'Task A', priority: 1, swimLane: 1 },
    { id: 2, taskName: 'Task B', priority: 2, swimLane: 1 },
    { id: 3, taskName: 'Task C', priority: 3, swimLane: 1 },
  ],
  2: [
    { id: 4, taskName: 'Task D', priority: 1, swimLane: 2 },
    { id: 5, taskName: 'Task E', priority: 2, swimLane: 2 },
  ],
  3: [
    { id: 6, taskName: 'Task F', priority: 1, swimLane: 3 },
  ],
};

describe('taskHelpers', () => {
  describe('calculateAffectedTasks', () => {
    it('calculates affected tasks when moving between different swim lanes', () => {
      const result = calculateAffectedTasks(
        mockTasks,
        1, // taskId
        1, // source
        2, // destination
        1 // destinationIndex
      );

      expect(result.length).toBeGreaterThan(0);
    });

    it('returns empty array for invalid task', () => {
      const result = calculateAffectedTasks(
        mockTasks,
        999, // non-existent taskId
        1,
        2,
        1
      );

      expect(result).toHaveLength(0);
    });
  });
});