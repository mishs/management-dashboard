export class Tasks {
  private tasks: Entity<Task> = {
    0: {
      id: 0,
      taskName: 'Task A',
      priority: 1,
      swimLane: 1,
    },
    1: {
      id: 1,
      taskName: 'Task B',
      priority: 2,
      swimLane: 1,
    },
    2: {
      id: 2,
      taskName: 'Task C',
      priority: 3,
      swimLane: 1,
    },
    3: {
      id: 3,
      taskName: 'Task D',
      priority: 4,
      swimLane: 1,
    },
    4: {
      id: 4,
      taskName: 'Task E',
      priority: 5,
      swimLane: 1,
    },
    5: {
      id: 5,
      taskName: 'Task F',
      priority: 1,
      swimLane: 2,
    },
    6: {
      id: 6,
      taskName: 'Task G',
      priority: 2,
      swimLane: 2,
    },
    7: {
      id: 7,
      taskName: 'Task H',
      priority: 3,
      swimLane: 2,
    },
    8: {
      id: 8,
      taskName: 'Task I',
      priority: 4,
      swimLane: 2,
    },
    9: {
      id: 9,
      taskName: 'Task J',
      priority: 5,
      swimLane: 2,
    },
    10: {
      id: 10,
      taskName: 'Task K',
      priority: 1,
      swimLane: 3,
    },
    11: {
      id: 11,
      taskName: 'Task L',
      priority: 2,
      swimLane: 3,
    },
    12: {
      id: 12,
      taskName: 'Task M',
      priority: 3,
      swimLane: 3,
    },
    13: {
      id: 13,
      taskName: 'Task N',
      priority: 4,
      swimLane: 3,
    },
    14: {
      id: 14,
      taskName: 'Task O',
      priority: 5,
      swimLane: 3,
    },
  };
  private tempTasks = this.tasks;

  public getTasks(): Entity<Task[]> {
    const swimLane1 = Object.values(this.tasks)
      .filter((task) => task.swimLane === 1)
      .map((task) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { swimLane, ...rest } = task;
        return { ...rest };
      })
      .sort((a, b) => a.priority - b.priority);
    const swimLane2 = Object.values(this.tasks)
      .filter((task) => task.swimLane === 2)
      .map((task) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { swimLane, ...rest } = task;
        return { ...rest };
      })
      .sort((a, b) => a.priority - b.priority);
    const swimLane3 = Object.values(this.tasks)
      .filter((task) => task.swimLane === 3)
      .map((task) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
};

type Entity<T> = {
  [key: number]: T;
};
