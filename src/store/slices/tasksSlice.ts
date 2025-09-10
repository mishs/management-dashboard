import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Task, SwimLane } from '../../types/task';

interface TasksState {
  tasks: Record<SwimLane, Task[]>;
}

const initialState: TasksState = {
  tasks: {
    1: [],
    2: [],
    3: [],
  },
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
    setTasks: (state, action: PayloadAction<Record<SwimLane, Task[]>>) => {
      state.tasks = action.payload;
    },
    moveTask: (state, action: PayloadAction<MoveTaskPayload>) => {
      const { taskId, sourceSwimLane, destinationSwimLane, destinationIndex } = action.payload;
      
      // Find and remove task from source
      const sourceIndex = state.tasks[sourceSwimLane].findIndex(task => task.id === taskId);
      if (sourceIndex === -1) return;
      
      const [task] = state.tasks[sourceSwimLane].splice(sourceIndex, 1);
      
      // Update task's swim lane
      task.swimLane = destinationSwimLane;
      
      // Insert task at destination
      state.tasks[destinationSwimLane].splice(destinationIndex, 0, task);
      
      // Recompute priorities for both lanes
      state.tasks[sourceSwimLane].forEach((task, index) => {
        task.priority = index + 1;
      });
      
      state.tasks[destinationSwimLane].forEach((task, index) => {
        task.priority = index + 1;
      });
    },
  },
});

export const { setTasks, moveTask } = tasksSlice.actions;
export default tasksSlice.reducer;