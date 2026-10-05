import { http, HttpResponse } from 'msw';
import type { Task } from '../types';

// Browser mock of the original bulk-update API (MSW). The running app uses the
// real API in server/; this mock is kept for component work without a backend.

type LaneId = 1 | 2 | 3;
type Board = Record<LaneId, Task[]>;
const LANES: readonly LaneId[] = [1, 2, 3];

export interface TaskUpdate {
  id: number;
  taskName: string;
  priority: number;
  swimLane: LaneId;
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const isLaneId = (value: unknown): value is LaneId => LANES.some((lane) => lane === value);

/** Validates the request body instead of trusting a cast. */
export const isTaskUpdateList = (value: unknown): value is TaskUpdate[] =>
  Array.isArray(value) &&
  value.every(
    (item) =>
      isRecord(item) &&
      Number.isInteger(item.id) &&
      typeof item.taskName === 'string' &&
      Number.isInteger(item.priority) &&
      isLaneId(item.swimLane),
  );

const mockTasks: Board = {
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

// Deep copy: updates must not change the original fixture used as a fallback.
let tasks: Board = structuredClone(mockTasks);

export const handlers = [
  http.get('/api/tasks', () => {
    return HttpResponse.json(tasks);
  }),

  http.post('/api/tasks', async ({ request }) => {
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return HttpResponse.json({ error: 'The request body is not valid JSON.' }, { status: 400 });
    }
    if (!isTaskUpdateList(body)) {
      return HttpResponse.json({ error: 'Expected a list of task updates.' }, { status: 400 });
    }

    for (const update of body) {
      for (const lane of LANES) {
        const laneTasks = tasks[lane];
        const index = laneTasks.findIndex((task) => task.id === update.id);
        if (index === -1) continue;
        if (lane !== update.swimLane) laneTasks.splice(index, 1);
        else laneTasks[index] = { ...laneTasks[index], ...update };
      }
      const target = tasks[update.swimLane];
      if (!target.some((task) => task.id === update.id)) {
        const original = LANES.flatMap((lane) => mockTasks[lane]).find((task) => task.id === update.id);
        if (original) target.push({ ...original, ...update });
      }
    }

    for (const lane of LANES) tasks[lane].sort((a, b) => a.priority - b.priority);
    return HttpResponse.json(tasks);
  }),
];

/** Test helper: restore the mock board to the fixture. */
export const resetMockTasks = () => {
  tasks = structuredClone(mockTasks);
};
