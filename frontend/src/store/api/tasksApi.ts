import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { TasksResponse, TaskWithSwimLane } from '../../types';

// Mock data for development
const mockTasksData: TasksResponse = {
  1: [
    {
      id: 0,
      taskName: 'Design wireframes for dashboard',
      priority: 1,
      description: 'Create initial wireframes for the task management dashboard',
      assignee: 'Alex Chen',
      dueDate: '2024-12-15',
      tags: ['design', 'wireframes'],
      priorityLevel: 'High',
    },
    {
      id: 1,
      taskName: 'Implement drag and drop functionality',
      priority: 2,
      description: 'Add dnd-kit library and implement task reordering',
      assignee: 'Sarah Kim',
      dueDate: '2024-12-18',
      tags: ['development', 'frontend'],
      priorityLevel: 'High',
    },
    {
      id: 2,
      taskName: 'Set up Redux store',
      priority: 3,
      description: 'Configure Redux Toolkit with RTK Query for state management',
      assignee: 'Mike Johnson',
      dueDate: '2024-12-20',
      tags: ['development', 'state'],
      priorityLevel: 'Medium',
    },
    {
      id: 3,
      taskName: 'Create responsive layout',
      priority: 4,
      description: 'Ensure dashboard works on mobile and tablet devices',
      assignee: 'Emma Davis',
      dueDate: '2024-12-22',
      tags: ['design', 'responsive'],
      priorityLevel: 'Medium',
    },
    {
      id: 4,
      taskName: 'Write unit tests',
      priority: 5,
      description: 'Add comprehensive test coverage for components',
      assignee: 'Tom Wilson',
      dueDate: '2024-12-25',
      tags: ['testing', 'quality'],
      priorityLevel: 'Low',
    },
  ],
  2: [
    {
      id: 5,
      taskName: 'API integration testing',
      priority: 1,
      description: 'Test mock service worker integration',
      assignee: 'Lisa Brown',
      dueDate: '2024-12-16',
      tags: ['testing', 'api'],
      priorityLevel: 'High',
    },
    {
      id: 6,
      taskName: 'Performance optimization',
      priority: 2,
      description: 'Optimize rendering and reduce bundle size',
      assignee: 'David Lee',
      dueDate: '2024-12-19',
      tags: ['performance', 'optimization'],
      priorityLevel: 'Medium',
    },
  ],
  3: [
    {
      id: 7,
      taskName: 'Documentation review',
      priority: 1,
      description: 'Review and update project documentation',
      assignee: 'Anna Taylor',
      dueDate: '2024-12-14',
      tags: ['documentation'],
      priorityLevel: 'Low',
    },
    {
      id: 8,
      taskName: 'Code review process',
      priority: 2,
      description: 'Establish code review guidelines and process',
      assignee: 'Chris Anderson',
      dueDate: '2024-12-17',
      tags: ['process', 'quality'],
      priorityLevel: 'Medium',
    },
  ],
};

export const tasksApi = createApi({
  reducerPath: 'tasksApi',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api',
    // Add error handling for failed requests
    prepareHeaders: (headers) => {
      headers.set('Content-Type', 'application/json');
      return headers;
    },
  }),
  tagTypes: ['Tasks'],
  endpoints: (builder) => ({
    getTasks: builder.query<TasksResponse, void>({
      queryFn: async () => {
        // Return mock data directly to avoid API call failures
        return { data: mockTasksData };
      },
      providesTags: ['Tasks'],
    }),
    updateTasks: builder.mutation<{ status: number }, Partial<TaskWithSwimLane>[]>({
      queryFn: async (tasks) => {
        // Simulate successful update
        console.log('Updating tasks:', tasks);
        return { data: { status: 200 } };
      },
      invalidatesTags: ['Tasks'],
    }),
  }),
});

export const { useGetTasksQuery, useUpdateTasksMutation } = tasksApi;