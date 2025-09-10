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

const renderTaskCard = (task: TaskWithSwimLane = mockTask) => {
  return render(
    <DndContext onDragEnd={() => {}}>
      <TaskCard task={task} />
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
    expect(screen.getByTestId('task-priority-1')).toBeInTheDocument();
    expect(screen.getByTestId('task-priority-1')).toHaveTextContent('Priority: 1');
  });

  it('renders with correct priority for different tasks', () => {
    const highPriorityTask: TaskWithSwimLane = {
      id: 2,
      taskName: 'High Priority Task',
      priority: 10,
      swimLane: 1,
    };
    
    renderTaskCard(highPriorityTask);
    expect(screen.getByText('High Priority Task')).toBeInTheDocument();
    expect(screen.getByTestId('task-priority-2')).toBeInTheDocument();
  });

  it('handles long task names', () => {
    const longNameTask: TaskWithSwimLane = {
      id: 3,
      taskName: 'This is a very long task name that should be handled properly by the component',
      priority: 5,
      swimLane: 1,
    };
    
    renderTaskCard(longNameTask);
    expect(screen.getByText(longNameTask.taskName)).toBeInTheDocument();
  });
});