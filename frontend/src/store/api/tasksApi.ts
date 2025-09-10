import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { TasksResponse, TaskWithSwimLane } from '../../types/index';

export const tasksApi = createApi({
  reducerPath: 'tasksApi',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api',
    prepareHeaders: (headers) => {
      console.log('🔍 Making API request to:', '/api');
      return headers;
    },
  }),
  tagTypes: ['Tasks'],
  endpoints: (builder) => ({
    getTasks: builder.query<TasksResponse, void>({
      query: () => '/tasks',
      providesTags: ['Tasks'],
      transformResponse: (response: TasksResponse) => {
        console.log('✅ API Response received:', response);
        return response;
      },
      transformErrorResponse: (response) => {
        console.error('❌ API Error:', response);
        return response;
      },
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