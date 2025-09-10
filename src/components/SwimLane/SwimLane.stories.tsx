import type { Meta, StoryObj } from '@storybook/react';
import { SwimLane } from './SwimLane';
import { DndContext } from '@dnd-kit/core';
import { SwimLane as SwimLaneEnum } from '../../types/task';

const meta: Meta<typeof SwimLane> = {
  title: 'Components/SwimLane',
  component: SwimLane,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <DndContext onDragEnd={() => {}}>
        <div style={{ width: '400px' }}>
          <Story />
        </div>
      </DndContext>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

const sampleTasks = [
  { id: 1, taskName: 'Task A', priority: 1 },
  { id: 2, taskName: 'Task B', priority: 2 },
  { id: 3, taskName: 'Task C', priority: 3 },
];

export const TodoSwimLane: Story = {
  args: {
    swimLane: SwimLaneEnum.TODO,
    tasks: sampleTasks,
  },
};

export const InProgressSwimLane: Story = {
  args: {
    swimLane: SwimLaneEnum.IN_PROGRESS,
    tasks: sampleTasks.slice(0, 2),
  },
};

export const CompletedSwimLane: Story = {
  args: {
    swimLane: SwimLaneEnum.COMPLETED,
    tasks: sampleTasks.slice(0, 1),
  },
};

export const EmptySwimLane: Story = {
  args: {
    swimLane: SwimLaneEnum.TODO,
    tasks: [],
  },
};