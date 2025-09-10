import { TaskWithSwimLane } from '../types';

export const calculateAffectedTasks = (
  tasks: { [key: number]: TaskWithSwimLane[] },
  movedTaskId: number,
  sourceLane: number,
  targetLane: number,
  newPosition: number
): Partial<TaskWithSwimLane>[] => {
  const affectedTasks: Partial<TaskWithSwimLane>[] = [];
  
  // Find the moved task
  const movedTask = tasks[sourceLane].find(task => task.id === movedTaskId);
  if (!movedTask) return affectedTasks;
  
  // If moving to a different lane
  if (sourceLane !== targetLane) {
    // Add the moved task with new lane and priority
    affectedTasks.push({
      id: movedTask.id,
      taskName: movedTask.taskName,
      priority: newPosition,
      swimLane: targetLane as 1 | 2 | 3,
    });
    
    // Update priorities in source lane (tasks after the moved task)
    tasks[sourceLane]
      .filter(task => task.id !== movedTaskId && task.priority > movedTask.priority)
      .forEach(task => {
        affectedTasks.push({
          id: task.id,
          taskName: task.taskName,
          priority: task.priority - 1,
          swimLane: sourceLane as 1 | 2 | 3,
        });
      });
    
    // Update priorities in target lane (tasks at and after the new position)
    tasks[targetLane]
      .filter(task => task.priority >= newPosition)
      .forEach(task => {
        affectedTasks.push({
          id: task.id,
          taskName: task.taskName,
          priority: task.priority + 1,
          swimLane: targetLane as 1 | 2 | 3,
        });
      });
  } else {
    // Moving within the same lane
    const oldPosition = movedTask.priority;
    
    if (oldPosition === newPosition) return affectedTasks;
    
    // Add the moved task with new priority
    affectedTasks.push({
      id: movedTask.id,
      taskName: movedTask.taskName,
      priority: newPosition,
      swimLane: sourceLane as 1 | 2 | 3,
    });
    
    if (oldPosition < newPosition) {
      // Moving down: shift tasks up
      tasks[sourceLane]
        .filter(task => task.id !== movedTaskId && task.priority > oldPosition && task.priority <= newPosition)
        .forEach(task => {
          affectedTasks.push({
            id: task.id,
            taskName: task.taskName,
            priority: task.priority - 1,
            swimLane: sourceLane as 1 | 2 | 3,
          });
        });
    } else {
      // Moving up: shift tasks down
      tasks[sourceLane]
        .filter(task => task.id !== movedTaskId && task.priority >= newPosition && task.priority < oldPosition)
        .forEach(task => {
          affectedTasks.push({
            id: task.id,
            taskName: task.taskName,
            priority: task.priority + 1,
            swimLane: sourceLane as 1 | 2 | 3,
          });
        });
    }
  }
  
  return affectedTasks;
};

export const getLaneStats = (tasks: TaskWithSwimLane[]) => {
  const stats = { high: 0, medium: 0, low: 0, total: tasks.length };
  
  tasks.forEach(task => {
    switch (task.priorityLevel) {
      case 'High':
        stats.high++;
        break;
      case 'Medium':
        stats.medium++;
        break;
      case 'Low':
        stats.low++;
        break;
    }
  });
  
  return stats;
};

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
};

export const isValidTaskMove = (
  tasks: { [key: number]: TaskWithSwimLane[] },
  taskId: number,
  sourceLane: number
): boolean => {
  return tasks[sourceLane]?.some(task => task.id === taskId) || false;
};

export const getNextPriority = (tasks: TaskWithSwimLane[]): number => {
  if (tasks.length === 0) return 1;
  return Math.max(...tasks.map(task => task.priority)) + 1;
};