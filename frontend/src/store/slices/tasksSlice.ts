import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { TaskWithSwimLane } from '../../types';

interface TasksState {
  tasks: { [key: number]: TaskWithSwimLane[] };
  activeTask: TaskWithSwimLane | null;
  saving: boolean;
}

const initialState: TasksState = {
  tasks: { 1: [], 2: [], 3: [] },
  activeTask: null,
  saving: false,
};

const tasksSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    setTasks: (state, action: PayloadAction<{ [key: number]: TaskWithSwimLane[] }>) => {
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
      
      // Find and remove task from source lane
      const sourceIndex = state.tasks[sourceLane].findIndex(task => task.id === taskId);
      if (sourceIndex === -1) return;
      
      const [task] = state.tasks[sourceLane].splice(sourceIndex, 1);
      
      // Update task properties
      task.swimLane = targetLane as 1 | 2 | 3;
      task.priority = newPriority;
      
      // Add to target lane at correct position
      state.tasks[targetLane].splice(newPriority - 1, 0, task);
      
      // Recompute priorities for both lanes
      state.tasks[sourceLane].forEach((t, index) => {
        t.priority = index + 1;
      });
      
      state.tasks[targetLane].forEach((t, index) => {
        t.priority = index + 1;
      });
    },
  },
});

export const { setTasks, setActiveTask, setSaving, moveTask } = tasksSlice.actions;
export default tasksSlice.reducer;