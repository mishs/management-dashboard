import type { Meta, StoryObj } from '@storybook/react';
import { TaskCard } from './TaskCard';
import { DndContext } from '@dnd-kit/core';

const meta: Meta<typeof TaskCard> = {
  title: 'Components/TaskCard',
  component: TaskCard,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <DndContext onDragEnd={() => {}}>
        <div style={{ width: '300px' }}>
          <Story />
        </div>
      </DndContext>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    task: {
      id: 1,
      taskName: 'Sample Task',
      priority: 1,
    },
    swimLane: 1,
  },
};

export const HighPriority: Story = {
  args: {
    task: {
      id: 2,
      taskName: 'High Priority Task with a Very Long Name That Might Wrap',
      priority: 10,
    },
    swimLane: 1,
  },
};

export const LowPriority: Story = {
  args: {
    task: {
      id: 3,
      taskName: 'Low Priority Task',
      priority: 1,
    },
    swimLane: 3,
  },
};