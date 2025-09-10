import { Task, SwimLane, UpdateTaskPayload } from '../types/task';

export const calculateAffectedTasks = (
  tasks: Record<SwimLane, Task[]>,
  movedTaskId: number,
  sourceSwimLane: SwimLane,
  destinationSwimLane: SwimLane,
  destinationIndex: number
): UpdateTaskPayload[] => {
  const affectedTasks: UpdateTaskPayload[] = [];
  
  // Find the moved task
  const movedTask = tasks[sourceSwimLane].find(task => task.id === movedTaskId);
  if (!movedTask) return [];

  // If moving between different swim lanes
  if (sourceSwimLane !== destinationSwimLane) {
    // Update all tasks in source swim lane (excluding moved task)
    tasks[sourceSwimLane]
      .filter(task => task.id !== movedTaskId)
      .forEach((task, index) => {
        affectedTasks.push({
          id: task.id,
          taskName: task.taskName,
          priority: index + 1,
          swimLane: sourceSwimLane,
        });
      });

    // Create new destination array with moved task inserted
    const destinationTasks = [...tasks[destinationSwimLane]];
    destinationTasks.splice(destinationIndex, 0, { ...movedTask, swimLane: destinationSwimLane });

    // Update all tasks in destination swim lane
    destinationTasks.forEach((task, index) => {
      affectedTasks.push({
        id: task.id,
        taskName: task.taskName,
        priority: index + 1,
        swimLane: destinationSwimLane,
      });
    });
  } else {
    // Moving within the same swim lane
    const swimLaneTasks = [...tasks[sourceSwimLane]];
    const currentIndex = swimLaneTasks.findIndex(task => task.id === movedTaskId);
    
    // Remove task from current position
    const [task] = swimLaneTasks.splice(currentIndex, 1);
    
    // Insert at new position
    swimLaneTasks.splice(destinationIndex, 0, task);
    
    // Update priorities for all tasks in the swim lane
    swimLaneTasks.forEach((task, index) => {
      affectedTasks.push({
        id: task.id,
        taskName: task.taskName,
        priority: index + 1,
        swimLane: sourceSwimLane,
      });
    });
  }

  return affectedTasks;
};

export const isValidTaskMove = (
  tasks: Record<SwimLane, Task[]>,
  taskId: number,
  sourceSwimLane: SwimLane
): boolean => {
  return tasks[sourceSwimLane].some(task => task.id === taskId);
};

export const getNextPriority = (tasks: Task[]): number => {
  if (tasks.length === 0) return 1;
  return Math.max(...tasks.map(task => task.priority)) + 1;
};