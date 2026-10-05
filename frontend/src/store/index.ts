import { configureStore } from '@reduxjs/toolkit';
import { tasksApi } from './api/tasksApi';
import tasksSlice from './slices/tasksSlice';

export const makeStore = () =>
  configureStore({
    reducer: {
      tasks: tasksSlice,
      [tasksApi.reducerPath]: tasksApi.reducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(tasksApi.middleware),
  });

export const store = makeStore();

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];
