import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TaskCard } from './TaskCard';
import { DndContext } from '@dnd-kit/core';
import { TaskWithSwimLane } from '../../types/index';

const mockTask: TaskWithSwimLane = {
  id: 1,
  taskName: 'Test Task',
  priority: 1,
  swimLane: 1,
};

const renderTaskCard = (task: TaskWithSwimLane = mockTask, swimLane: number = 1) => {
  return render(
    <DndContext onDragEnd={() => {}}>
      <TaskCard task={task} swimLane={swimLane} />
    </DndContext>
  );
};

describe('TaskCard', () => {
  it('renders task name correctly', () => {
    renderTaskCard();
    expect(screen.getByText('Test Task')).toBeInTheDocument();
  });

  it('displays priority number', () => {
    renderTaskCard();
    expect(screen.getByText('#1')).toBeInTheDocument();
  });

  it('renders with correct priority for different tasks', () => {
    const highPriorityTask: Task = {
      id: 2,
      taskName: 'High Priority Task',
      priority: 10,
    };
    
    renderTaskCard(highPriorityTask);
    expect(screen.getByText('High Priority Task')).toBeInTheDocument();
    expect(screen.getByText('#10')).toBeInTheDocument();
  });

  it('handles long task names', () => {
    const longNameTask: Task = {
      id: 3,
      taskName: 'This is a very long task name that should be handled properly by the component',
      priority: 5,
    };
    
    renderTaskCard(longNameTask);
    expect(screen.getByText(longNameTask.taskName)).toBeInTheDocument();
  });
});