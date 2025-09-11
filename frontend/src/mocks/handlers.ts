import { http, HttpResponse } from 'msw';

// Mock task data
const mockTasks = {
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

let tasks = { ...mockTasks };

export const handlers = [
  http.get('/api/tasks', () => {
    return HttpResponse.json(tasks);
  }),
  
  http.post('/api/tasks', async ({ request }) => {
    try {
      const updatedTasks = await request.json() as Array<{
        id: number;
        taskName: string;
        priority: number;
        swimLane: number;
      }>;
      
      // Update tasks based on the payload
      updatedTasks.forEach((updatedTask) => {
        // Find the task in all swim lanes and update it
        Object.keys(tasks).forEach((laneKey) => {
          const lane = laneKey;
          const laneTasks = (tasks as any)[lane];
          const taskIndex = laneTasks.findIndex((task: any) => task.id === updatedTask.id);
          if (taskIndex !== -1) {
            // Remove from current lane if moving to different lane
            if (parseInt(lane) !== updatedTask.swimLane) {
              laneTasks.splice(taskIndex, 1);
            } else {
              // Update in same lane
              laneTasks[taskIndex] = {
                ...laneTasks[taskIndex],
                ...updatedTask
              };
            }
          }
        });
        // Add to new lane if moving
        const targetLane = String(updatedTask.swimLane);
        const targetLaneTasks = (tasks as any)[targetLane];
        if (!targetLaneTasks.find((task: any) => task.id === updatedTask.id)) {
          const originalTask = Object.values(mockTasks).flat().find((task: any) => task.id === updatedTask.id);
          if (originalTask) {
            targetLaneTasks.push({
              ...originalTask,
              ...updatedTask
            });
          }
        }
      });
      
      // Sort tasks by priority in each lane
      Object.keys(tasks).forEach((laneKey) => {
        const laneTasks = (tasks as any)[laneKey];
        laneTasks.sort((a: any, b: any) => a.priority - b.priority);
      });
      // Return updated tasks so frontend can sync
      return HttpResponse.json(tasks);
    } catch (error) {
      return new HttpResponse(null, {
        status: 400,
        statusText: (error as Error).message,
      });
    }
  }),
];