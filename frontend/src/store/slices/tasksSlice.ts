import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { TaskWithSwimLane } from '../../types';
import { tasksApi } from '../api/tasksApi';

interface TasksState {
  tasks: TaskWithSwimLane[];
  activeTask: string | null;
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
    setActiveTask: (state, action: PayloadAction<string | null>) => {
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
      
      // Update the task's swim lane
      state.tasks[taskIndex].swimLane = targetLane as 1 | 2 | 3;
      
      // Recompute priorities for all tasks in both lanes
      const sourceTasks = state.tasks.filter(t => t.swimLane === sourceLane);
      const targetTasks = state.tasks.filter(t => t.swimLane === targetLane);
      
      // Update priorities for source lane
      sourceTasks
        .sort((a, b) => a.priority - b.priority)
        .forEach((task, index) => {
          const idx = state.tasks.findIndex(t => t.id === task.id);
          if (idx !== -1) {
            state.tasks[idx].priority = index + 1;
          }
        });
      
      // Update priorities for target lane
      targetTasks
        .sort((a, b) => a.priority - b.priority)
        .forEach((task, index) => {
          const idx = state.tasks.findIndex(t => t.id === task.id);
          if (idx !== -1) {
            state.tasks[idx].priority = index + 1;
          }
        });
    },
  },
  extraReducers: (builder) => {
    // Only update tasks from API if we don't have local tasks
    builder.addMatcher(
      tasksApi.endpoints.getTasks.matchFulfilled,
      (state, action) => {
        if (state.tasks.length === 0) {
          const transformedTasks: TaskWithSwimLane[] = Object.entries(action.payload).flatMap(([laneId, laneTasks]) =>
            laneTasks.map((task: any) => ({
              ...task,
              swimLane: parseInt(laneId) as 1 | 2 | 3,
            }))
          );
          state.tasks = transformedTasks;
        }
      }
    );
  },
});

export const { setTasks, setActiveTask, setSaving, moveTask } = tasksSlice.actions;
export default tasksSlice.reducer;