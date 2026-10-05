export interface Task {
  id: number;
  taskName: string;
  priority: number;
  swimLane?: 1 | 2 | 3;
  description?: string;
  assignee?: string;
  dueDate?: string;
  tags?: string[];
  priorityLevel?: 'High' | 'Medium' | 'Low';
}

export interface TaskWithSwimLane extends Task {
  swimLane: 1 | 2 | 3;
}

export interface TasksResponse {
  [key: number]: Task[];
}

export interface DragEndEvent {
  active: {
    id: string;
    data: {
      current?: {
        task: TaskWithSwimLane;
      };
    };
  };
  over: {
    id: string;
  } | null;
}

export interface LaneStats {
  high: number;
  medium: number;
  low: number;
  total: number;
}

export const LANE_NAMES = {
  1: 'To Do',
  2: 'In Progress',
  3: 'Completed'
} as const;

export const LANE_COLORS = {
  1: '#1976d2', // MUI Primary Blue
  2: '#ff9800', // Orange
  3: '#2e7d32'  // MUI Success Green
} as const;
export type LaneId = keyof typeof LANE_NAMES;

/** Board as confirmed by the server. `revision` increases with every committed move. */
export interface BoardResponse {
  revision: number;
  tasks: TaskWithSwimLane[];
  operation?: { id: string; applied: boolean; replayed?: boolean };
}

export interface MoveRequest {
  operationId: string;
  taskId: number;
  toLane: LaneId;
}
