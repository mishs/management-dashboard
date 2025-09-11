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
      
      // Find the task and update it
      const taskIndex = state.tasks.findIndex(t => t.id === taskId);
      if (taskIndex === -1) return;
      
      // Create a new task object with updated properties
      state.tasks[taskIndex] = {
        ...state.tasks[taskIndex],
        swimLane: targetLane as 1 | 2 | 3,
        priority: newPriority,
      };
      
      // Only recompute priorities if moving between different lanes
      if (sourceLane !== targetLane) {
        // Recompute priorities for source lane (shift tasks up)
        const sourceTasks = state.tasks
          .filter(t => t.swimLane === sourceLane && t.id !== taskId)
          .sort((a, b) => a.priority - b.priority);
        sourceTasks.forEach((t, index) => {
          const taskIdx = state.tasks.findIndex(task => task.id === t.id);
          if (taskIdx !== -1) {
            state.tasks[taskIdx] = { ...state.tasks[taskIdx], priority: index + 1 };
          }
        });
        
        // Recompute priorities for target lane
        const targetTasks = state.tasks
          .filter(t => t.swimLane === targetLane)
          .sort((a, b) => a.priority - b.priority);
        targetTasks.forEach((t, index) => {
          const taskIdx = state.tasks.findIndex(task => task.id === t.id);
          if (taskIdx !== -1) {
            state.tasks[taskIdx] = { ...state.tasks[taskIdx], priority: index + 1 };
          }
        });
      }
    },
    reorderLane: (state, action: PayloadAction<{ laneId: number }>) => {
      const { laneId } = action.payload;
        const laneTasks = state.tasks
          .filter(t => t.swimLane === laneId)
          .sort((a, b) => a.priority - b.priority);
        laneTasks.forEach((t, index) => {
          t.priority = index + 1;
        });
    },
  },
});

export const { setTasks, setActiveTask, setSaving, moveTask } = tasksSlice.actions;
export default tasksSlice.reducer;