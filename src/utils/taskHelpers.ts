import { Task, UpdateTaskPayload, SwimLane } from '../types/task';

/**
 * Calculates the affected tasks when moving a task between swim lanes
 * @param tasks - Current tasks state
 * @param taskId - ID of the task being moved
 * @param sourceSwimLane - Source swim lane
 * @param destinationSwimLane - Destination swim lane
 * @param destinationIndex - Index in destination swim lane
 * @returns Array of tasks that need to be updated in the backend
 */
export const calculateAffectedTasks = (
  tasks: Record<number, Task[]>,
  taskId: number,
  sourceSwimLane: SwimLane,
  destinationSwimLane: SwimLane,
  destinationIndex: number
): UpdateTaskPayload[] => {
  const affectedTasks: UpdateTaskPayload[] = [];
  const currentTasks = { ...tasks };
  
  // Find and remove the task from source
  const sourceTask = currentTasks[sourceSwimLane].find(task => task.id === taskId);
  if (!sourceTask) return [];

  currentTasks[sourceSwimLane] = currentTasks[sourceSwimLane].filter(task => task.id !== taskId);
  
  // Add to destination
  currentTasks[destinationSwimLane].splice(destinationIndex, 0, sourceTask);

  // Add affected tasks from source swimlane (if different from destination)
  if (sourceSwimLane !== destinationSwimLane) {
    currentTasks[sourceSwimLane].forEach((task, index) => {
      affectedTasks.push({
        id: task.id,
        priority: index + 1,
        taskName: task.taskName,
        swimLane: sourceSwimLane,
      });
    });
  }

  // Add affected tasks from destination swimlane
  currentTasks[destinationSwimLane].forEach((task, index) => {
    affectedTasks.push({
      id: task.id,
      priority: index + 1,
      taskName: task.taskName,
      swimLane: destinationSwimLane,
    });
  });

  return affectedTasks;
};

/**
 * Validates if a task move is valid
 * @param tasks - Current tasks state
 * @param taskId - ID of the task being moved
 * @param sourceSwimLane - Source swim lane
 * @returns boolean indicating if the move is valid
 */
export const isValidTaskMove = (
  tasks: Record<number, Task[]>,
  taskId: number,
  sourceSwimLane: SwimLane
): boolean => {
  return tasks[sourceSwimLane].some(task => task.id === taskId);
};

/**
 * Gets the next available priority for a swim lane
 * @param tasks - Tasks in the swim lane
 * @returns Next available priority number
 */
export const getNextPriority = (tasks: Task[]): number => {
  return tasks.length + 1;
};