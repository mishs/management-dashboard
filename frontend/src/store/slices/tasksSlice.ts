import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { TaskWithSwimLane } from '../../types';

interface TasksState {
  tasks: TaskWithSwimLane[];
  activeTask: TaskWithSwimLane | null;
  saving: boolean;
}

const initialState: TasksState = {
  tasks: [],
  activeTask: null,
  saving: false,
};

const tasksSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    setTasks: (state, action: PayloadAction<TaskWithSwimLane[]>) => {
      state.tasks = action.payload;
    },
    setActiveTask: (state, action: PayloadAction<TaskWithSwimLane | null>) => {
      state.activeTask = action.payload;
    },
    setSaving: (state, action: PayloadAction<boolean>) => {
      state.saving = action.payload;
    },
    moveTask: (state, action: PayloadAction<{
      taskId: number;
      sourceLane: number;
      targetLane: number;
      newPriority: number;
    }>) => {
      const { taskId, sourceLane, targetLane, newPriority } = action.payload;
      
      // Find the task in the flat array
      const task = state.tasks.find(t => t.id === taskId);
      if (!task) return;
      
      // Update the task's lane and priority
      task.swimLane = targetLane as 1 | 2 | 3;
      task.priority = newPriority;
      
      // Recompute priorities for source lane (shift tasks up)
      if (sourceLane !== targetLane) {
        const sourceTasks = state.tasks
          .filter(t => t.swimLane === sourceLane && t.id !== taskId)
          .sort((a, b) => a.priority - b.priority);
        sourceTasks.forEach((t, index) => {
          t.priority = index + 1;
        });
      }
      
      // Recompute priorities for target lane
      const targetTasks = state.tasks
        .filter(t => t.swimLane === targetLane)
        .sort((a, b) => a.priority - b.priority);
      targetTasks.forEach((t, index) => {
        t.priority = index + 1;
      });
    },
        const laneTasks = state.tasks
          .filter(t => t.swimLane === laneId)
          .sort((a, b) => a.priority - b.priority);
        laneTasks.forEach((t, index) => {
          t.priority = index + 1;
        });
      });
    },
  },
});

export const { setTasks, setActiveTask, setSaving, moveTask } = tasksSlice.actions;
export default tasksSlice.reducer;