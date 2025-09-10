import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { TasksState, Task, SwimLane } from '../../types/task';

interface TasksSliceState {
  tasks: TasksState;
  isLoading: boolean;
  error: string | null;
}

const initialState: TasksSliceState = {
  tasks: {
    1: [],
    2: [],
    3: [],
  },
  isLoading: false,
  error: null,
};

interface MoveTaskPayload {
  taskId: number;
  sourceSwimLane: SwimLane;
  destinationSwimLane: SwimLane;
  destinationIndex: number;
}

const tasksSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    setTasks: (state, action: PayloadAction<TasksState>) => {
      state.tasks = action.payload;
    },
    moveTask: (state, action: PayloadAction<MoveTaskPayload>) => {
      const { taskId, sourceSwimLane, destinationSwimLane, destinationIndex } = action.payload;
      
      // Find and remove task from source
      const sourceIndex = state.tasks[sourceSwimLane].findIndex(task => task.id === taskId);
      if (sourceIndex === -1) return;
      
      const [movedTask] = state.tasks[sourceSwimLane].splice(sourceIndex, 1);
      
      // Insert task at destination
      state.tasks[destinationSwimLane].splice(destinationIndex, 0, movedTask);
      
      // Update priorities for affected swim lanes
      state.tasks[sourceSwimLane].forEach((task, index) => {
        task.priority = index + 1;
      });
      
      state.tasks[destinationSwimLane].forEach((task, index) => {
        task.priority = index + 1;
      });
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const { setTasks, moveTask, setLoading, setError } = tasksSlice.actions;
export default tasksSlice.reducer;