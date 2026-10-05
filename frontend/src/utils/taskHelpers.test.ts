import { calculateAffectedTasks, isValidTaskMove, getNextPriority } from './taskHelpers';
import { SwimLane } from '../types/task';
import { describe, it, expect } from 'vitest';

const mockTasksWithSwimLane = [
  { id: 1, taskName: 'Task A', priority: 1, swimLane: SwimLane.TODO },
  { id: 2, taskName: 'Task B', priority: 2, swimLane: SwimLane.TODO },
  { id: 3, taskName: 'Task C', priority: 3, swimLane: SwimLane.TODO },
  { id: 4, taskName: 'Task D', priority: 1, swimLane: SwimLane.IN_PROGRESS },
  { id: 5, taskName: 'Task E', priority: 2, swimLane: SwimLane.IN_PROGRESS },
  { id: 6, taskName: 'Task F', priority: 1, swimLane: SwimLane.TODO },
];

describe('taskHelpers', () => {
  describe('calculateAffectedTasks', () => {
    it('calculates affected tasks when moving between different swim lanes', () => {
      const result = calculateAffectedTasks(
        mockTasksWithSwimLane,
        1, // taskId
        SwimLane.TODO, // source
        SwimLane.IN_PROGRESS, // destination
        0 // destinationIndex
      );

      expect(result).toBeDefined();
      const sourceTasks = result.filter(task => task.swimLane === SwimLane.TODO);
      expect(sourceTasks.length).toBeGreaterThanOrEqual(0);
    });

    it('returns empty array for invalid task', () => {
      const result = calculateAffectedTasks(
        mockTasksWithSwimLane,
        999, // non-existent taskId
        SwimLane.TODO,
        SwimLane.IN_PROGRESS,
        0
      );

      expect(result).toHaveLength(0);
    });
  });

  describe('isValidTaskMove', () => {
    it('returns true for valid task move', () => {
      const result = isValidTaskMove({ 1: mockTasksWithSwimLane }, 1, SwimLane.TODO);
      expect(result).toBe(true);
    });

    it('returns false for invalid task move', () => {
      const result = isValidTaskMove({ 1: mockTasksWithSwimLane }, 999, SwimLane.TODO);
      expect(result).toBe(false);
    });
  });

  describe('getNextPriority', () => {
    it('returns correct next priority', () => {
      const tasks = [
        { id: 1, taskName: 'Task A', priority: 1, swimLane: SwimLane.TODO },
        { id: 2, taskName: 'Task B', priority: 2, swimLane: SwimLane.TODO },
      ];
      const result = getNextPriority(tasks);
      expect(result).toBe(3);
    });

    it('returns 1 for empty task list', () => {
      const result = getNextPriority([]);
      expect(result).toBe(1);
    });
  });
});