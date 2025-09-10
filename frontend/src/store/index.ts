import { configureStore } from '@reduxjs/toolkit';
import { tasksApi } from './api/tasksApi';
import tasksSlice from './slices/tasksSlice';

export const store = configureStore({
  reducer: {
    tasks: tasksSlice,
    [tasksApi.reducerPath]: tasksApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(tasksApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;