import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { Task, TasksResponse, TaskWithSwimLane } from '../../types';

export const tasksApi = createApi({
  reducerPath: 'tasksApi',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api',
  }),
  tagTypes: ['Tasks'],
  endpoints: (builder) => ({
    getTasks: builder.query<TasksResponse, void>({
      query: () => '/tasks',
      providesTags: ['Tasks'],
    }),
    updateTasks: builder.mutation<{ status: number }, Partial<TaskWithSwimLane>[]>({
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