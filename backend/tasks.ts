export class Tasks {
  private tasks: Entity<Task> = {
    0: {
      id: 0,
      taskName: 'Design wireframes for dashboard',
      priority: 1,
      swimLane: 1,
      description: 'Create initial wireframes for the task management dashboard',
      assignee: 'Alex Chen',
      dueDate: '2024-12-15',
      tags: ['design', 'wireframes'],
      priorityLevel: 'High',
    },
    1: {
      id: 1,
      taskName: 'Implement drag and drop functionality',
      priority: 2,
      swimLane: 1,
      description: 'Add dnd-kit library and implement task reordering',
      assignee: 'Sarah Kim',
      dueDate: '2024-12-18',
      tags: ['development', 'frontend'],
      priorityLevel: 'High',
    },
    2: {
      id: 2,
      taskName: 'Set up Redux store',
      priority: 3,
      swimLane: 1,
      description: 'Configure Redux Toolkit with RTK Query for state management',
      assignee: 'Mike Johnson',
      dueDate: '2024-12-20',
      tags: ['development', 'state'],
      priorityLevel: 'Medium',
    },
    3: {
      id: 3,
      taskName: 'Create responsive layout',
      priority: 4,
      swimLane: 1,
      description: 'Ensure dashboard works on mobile and tablet devices',
      assignee: 'Emma Davis',
      dueDate: '2024-12-22',
      tags: ['design', 'responsive'],
      priorityLevel: 'Medium',
    },
    4: {
      id: 4,
      taskName: 'Write unit tests',
      priority: 5,
      swimLane: 1,
      description: 'Add comprehensive test coverage for components',
      assignee: 'Tom Wilson',
      dueDate: '2024-12-25',
      tags: ['testing', 'quality'],
      priorityLevel: 'Low',
    },
    5: {
      id: 5,
      taskName: 'API integration testing',
      priority: 1,
      swimLane: 2,
      description: 'Test mock service worker integration',
      assignee: 'Lisa Brown',
      dueDate: '2024-12-16',
      tags: ['testing', 'api'],
      priorityLevel: 'High',
    },
    6: {
      id: 6,
      taskName: 'Performance optimization',
      priority: 2,
      swimLane: 2,
      description: 'Optimize rendering and reduce bundle size',
      assignee: 'David Lee',
      dueDate: '2024-12-19',
      tags: ['performance', 'optimization'],
      priorityLevel: 'Medium',
    },
    7: {
      id: 7,
      taskName: 'Documentation review',
      priority: 1,
      swimLane: 3,
      description: 'Review and update project documentation',
      assignee: 'Anna Taylor',
      dueDate: '2024-12-14',
      tags: ['documentation'],
      priorityLevel: 'Low',
    },
    8: {
      id: 8,
      taskName: 'Code review process',
      priority: 2,
      swimLane: 3,
      description: 'Establish code review guidelines and process',
      assignee: 'Chris Anderson',
      dueDate: '2024-12-17',
      tags: ['process', 'quality'],
      priorityLevel: 'Medium',
    },
  };
  private tempTasks = this.tasks;

  public getTasks(): Entity<Task[]> {
    const swimLane1 = Object.values(this.tasks)
      .filter((task) => task.swimLane === 1)
      .map((task) => {
        const { swimLane, ...rest } = task;
        return { ...rest };
      })
      .sort((a, b) => a.priority - b.priority);
    const swimLane2 = Object.values(this.tasks)
      .filter((task) => task.swimLane === 2)
      .map((task) => {
        const { swimLane, ...rest } = task;
        return { ...rest };
      })
      .sort((a, b) => a.priority - b.priority);
    const swimLane3 = Object.values(this.tasks)
      .filter((task) => task.swimLane === 3)
      .map((task) => {
        const { swimLane, ...rest } = task;
        return { ...rest };
      })
      .sort((a, b) => a.priority - b.priority);

    return {
      1: swimLane1,
      2: swimLane2,
      3: swimLane3,
    };
  }

  public updateTasks(tasks: Partial<Task>[]): void {
    tasks.forEach((task) => {
      if (!task.swimLane) throw new Error('Task swim lane is required');
      if (!task.taskName) throw new Error('Task name is required');
      if (!task.priority) throw new Error('Task priority is required');
      if (task.id === undefined) throw new Error('Task id is required');
      if (!this.tasks[task.id])
        throw new Error(`Task with id ${task.id} does not exist`);

      const oldTask = this.tempTasks[task.id];
      this.tempTasks[task.id] = { ...oldTask, ...task };
    });

    Object.entries(this.tempTasks).reduce(
      (acc: Entity<number[]>, [, value]) => {
        const taskPriority = value.priority;
        if (acc[value.swimLane as number].includes(taskPriority)) {
          throw new Error(
            `Task with priority ${taskPriority} already exists for swim lane ${value.swimLane}`,
          );
        }
        acc[value.swimLane as number].push(taskPriority);

        return acc;
      },
      { 1: [], 2: [], 3: [] },
    );

    this.tasks = this.tempTasks;
  }
}

export type Task = {
  id: number;
  taskName: string;
  priority: number;
  swimLane?: number;
  description?: string;
  assignee?: string;
  dueDate?: string;
  tags?: string[];
  priorityLevel?: 'High' | 'Medium' | 'Low';
};

type Entity<T> = {
  [key: number]: T;
};