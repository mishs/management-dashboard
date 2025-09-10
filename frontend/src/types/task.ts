export interface Task {
  id: number;
  taskName: string;
  priority: number;
  description?: string;
  assignee?: string;
  dueDate?: string;
  tags?: string[];
  priorityLevel?: 'High' | 'Medium' | 'Low';
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

export const SWIM_LANE_COLORS = {
  [SwimLane.TODO]: '#1976d2',
  [SwimLane.IN_PROGRESS]: '#ff9800',
  [SwimLane.COMPLETED]: '#2e7d32',
} as const;

export const PRIORITY_COLORS = {
  High: '#d32f2f',
  Medium: '#eab308',
  Low: '#2e7d32',
} as const;