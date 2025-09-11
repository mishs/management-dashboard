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
      console.log('🏪 Redux setTasks:', action.payload.length);
      state.tasks = action.payload;
    },
    setActiveTask: (state, action: PayloadAction<string | null>) => {
      console.log('🎯 Redux setActiveTask:', action.payload);
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
      console.log('🔄 Redux moveTask:', { taskId, sourceLane, targetLane });
      
      // Find the task and update it
      const taskIndex = state.tasks.findIndex(t => t.id === taskId);
      if (taskIndex === -1) {
        console.log('❌ Redux: Task not found:', taskId);
        return;
      }
      
      console.log('📍 Found task at index:', taskIndex, 'current lane:', state.tasks[taskIndex].swimLane);
      
      // Create a new task object with updated swim lane (immutable update)
      state.tasks[taskIndex] = {
        ...state.tasks[taskIndex],
        swimLane: targetLane as 1 | 2 | 3,
      };
      console.log('✅ Updated task swimLane to:', targetLane);
      
      // Recompute priorities for all tasks in both lanes
      const sourceTasks = state.tasks.filter(t => t.swimLane === sourceLane);
      const targetTasks = state.tasks.filter(t => t.swimLane === targetLane);
      console.log('📊 Lane counts after move:', {
        sourceLane,
        sourceCount: sourceTasks.length,
        targetLane,
        targetCount: targetTasks.length,
      });
      
      // Update priorities for source lane
      sourceTasks
        .sort((a, b) => a.priority - b.priority)
        .forEach((task, index) => {
          const idx = state.tasks.findIndex(t => t.id === task.id);
          if (idx !== -1) {
            state.tasks[idx] = {
              ...state.tasks[idx],
              priority: index + 1,
            };
          }
        });
      
      // Update priorities for target lane
      targetTasks
        .sort((a, b) => a.priority - b.priority)
        .forEach((task, index) => {
          const idx = state.tasks.findIndex(t => t.id === task.id);
          if (idx !== -1) {
            state.tasks[idx] = {
              ...state.tasks[idx],
              priority: index + 1,
            };
          }
        });
      console.log('✅ Redux moveTask completed');
    },
  },
  extraReducers: (builder) => {
    // Initialize tasks from API only once
    builder.addMatcher(
      tasksApi.endpoints.getTasks.matchFulfilled,
      (state, action) => {
        console.log('📡 API response received, local tasks:', state.tasks.length);
        if (state.tasks.length === 0) {
          const transformedTasks: TaskWithSwimLane[] = Object.entries(action.payload).flatMap(([laneId, laneTasks]) =>
            laneTasks.map((task: any) => ({
              ...task,
              swimLane: parseInt(laneId) as 1 | 2 | 3,
            }))
          );
          console.log('📥 Initializing tasks from API:', transformedTasks.length);
          state.tasks = transformedTasks;
        } else {
          console.log('⏭️ Skipping API data, using existing local tasks');
        }
      }
    );
  },
});

export const { setTasks, setActiveTask, setSaving, moveTask } = tasksSlice.actions;
export default tasksSlice.reducer;