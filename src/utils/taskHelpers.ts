import { Task, SwimLane, UpdateTaskPayload } from '../types/task';

export const calculateAffectedTasks = (
  tasks: Record<SwimLane, Task[]>,
  movedTaskId: number,
  sourceSwimLane: SwimLane,
  destinationSwimLane: SwimLane,
  destinationIndex: number
): UpdateTaskPayload[] => {
  const affectedTasks: UpdateTaskPayload[] = [];
  
  // Get current state after the move
  const sourceTasks = tasks[sourceSwimLane];
  const destinationTasks = tasks[destinationSwimLane];
  
  // Add all tasks from source lane (if different from destination)
  if (sourceSwimLane !== destinationSwimLane) {
    sourceTasks.forEach((task) => {
      affectedTasks.push({
        id: task.id,
        taskName: task.taskName,
        priority: task.priority,
        swimLane: task.swimLane,
      });
    });
  }
  
  // Add all tasks from destination lane
  destinationTasks.forEach((task) => {
    affectedTasks.push({
      id: task.id,
      taskName: task.taskName,
      priority: task.priority,
      swimLane: task.swimLane,
    });
  });
  
  return affectedTasks;
};