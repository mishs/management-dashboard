export interface Task {
  id: number;
  taskName: string;
  priority: number;
}

export interface TaskWithSwimLane extends Task {
  swimLane: number;
}

export interface TasksState {
  1: Task[];
  2: Task[];
  3: Task[];
}

export interface UpdateTaskPayload {
  id: number;
  priority: number;
  taskName: string;
  swimLane: number;
}

export enum SwimLane {
  TODO = 1,
  IN_PROGRESS = 2,
  COMPLETED = 3,
}

export const SWIM_LANE_LABELS = {
  [SwimLane.TODO]: 'To Do',
  [SwimLane.IN_PROGRESS]: 'In Progress',
  [SwimLane.COMPLETED]: 'Completed',
} as const;