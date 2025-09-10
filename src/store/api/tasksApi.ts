import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { TasksState, UpdateTaskPayload } from '../../types/task';

export const tasksApi = createApi({
  reducerPath: 'tasksApi',
  baseQuery: fetchBaseQuery({ baseUrl: '/api' }),
  tagTypes: ['Tasks'],
  endpoints: (builder) => ({
    getTasks: builder.query<TasksState, void>({
      query: () => '/tasks',
      providesTags: ['Tasks'],
    }),
    updateTasks: builder.mutation<{ status: number }, UpdateTaskPayload[]>({
      query: (tasks) => ({
        url: '/tasks',
        method: 'POST',
        body: tasks,
      }),
      invalidatesTags: ['Tasks'],
    }),
  }),
});

export const { useGetTasksQuery, useUpdateTasksMutation } = tasksApi;