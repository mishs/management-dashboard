import { calculateAffectedTasks, isValidTaskMove, getNextPriority } from './taskHelpers';
import { SwimLane, Task } from '../types/task';

const mockTasks = {
  1: [
    { id: 1, taskName: 'Task A', priority: 1 },
    { id: 2, taskName: 'Task B', priority: 2 },
    { id: 3, taskName: 'Task C', priority: 3 },
  ],
  2: [
    { id: 4, taskName: 'Task D', priority: 1 },
    { id: 5, taskName: 'Task E', priority: 2 },
  ],
  3: [
    { id: 6, taskName: 'Task F', priority: 1 },
  ],
};

describe('taskHelpers', () => {
  describe('calculateAffectedTasks', () => {
    it('calculates affected tasks when moving between different swim lanes', () => {
      const result = calculateAffectedTasks(
        mockTasks,
        1, // taskId
        SwimLane.TODO, // source
        SwimLane.IN_PROGRESS, // destination
        0 // destinationIndex
      );

      expect(result).toHaveLength(4); // 2 from source + 2 from destination (including moved task)
      
      // Check source swim lane tasks have correct priorities
      const sourceTasks = result.filter(task => task.swimLane === SwimLane.TODO);
      expect(sourceTasks).toHaveLength(2);
      expect(sourceTasks[0].priority).toBe(1);
      expect(sourceTasks[1].priority).toBe(2);
    });

    it('returns empty array for invalid task', () => {
      const result = calculateAffectedTasks(
        mockTasks,
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
      const result = isValidTaskMove(mockTasks, 1, SwimLane.TODO);
      expect(result).toBe(true);
    });

    it('returns false for invalid task move', () => {
      const result = isValidTaskMove(mockTasks, 999, SwimLane.TODO);
      expect(result).toBe(false);
    });
  });

  describe('getNextPriority', () => {
    it('returns correct next priority', () => {
      const tasks: Task[] = [
        { id: 1, taskName: 'Task A', priority: 1 },
        { id: 2, taskName: 'Task B', priority: 2 },
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