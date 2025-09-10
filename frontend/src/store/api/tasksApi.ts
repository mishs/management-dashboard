import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { Task, UpdateTaskPayload } from '../../types/task';

export const tasksApi = createApi({
  reducerPath: 'tasksApi',
  baseQuery: fetchBaseQuery({ baseUrl: '/api' }),
  tagTypes: ['Task'],
  endpoints: (builder) => ({
    getTasks: builder.query<Record<number, Task[]>, void>({
      query: () => '/tasks',
      providesTags: ['Task'],
    }),
    updateTasks: builder.mutation<void, UpdateTaskPayload[]>({
      query: (tasks) => ({
        url: '/tasks',
        method: 'POST',
        body: tasks,
      }),
      invalidatesTags: ['Task'],
    }),
  }),
});

export const { useGetTasksQuery, useUpdateTasksMutation } = tasksApi;