import type { Meta, StoryObj } from '@storybook/react';
import { DndContext } from '@dnd-kit/core';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline, Box } from '@mui/material';
import { TaskCard } from './TaskCard';
import { theme } from '@theme';
import { TaskWithSwimLane } from '@types';

const sampleTask: TaskWithSwimLane = {
  id: 1,
  taskName: 'Design wireframes for dashboard',
  priority: 1,
  swimLane: 1,
  description: 'Create initial wireframes for the task management dashboard',
  assignee: 'Alex Chen',
  dueDate: '2024-12-15',
  tags: ['design', 'wireframes'],
  priorityLevel: 'High',
};

const meta: Meta<typeof TaskCard> = {
  title: 'Dashboard/TaskCard',
  component: TaskCard,
  parameters: {
    layout: 'padded',
  },
  decorators: [
    (Story) => (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <DndContext onDragEnd={() => {}}>
          <Box sx={{ maxWidth: 300 }}>
            <Story />
          </Box>
        </DndContext>
      </ThemeProvider>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof TaskCard>;

export const HighPriorityTask: Story = {
  name: 'High Priority Task',
  args: {
    task: sampleTask,
    isDragging: false,
  },
};

export const MediumPriorityTask: Story = {
  name: 'Medium Priority Task',
  args: {
    task: {
      ...sampleTask,
      id: 2,
      priorityLevel: 'Medium',
      taskName: 'Set up Redux store',
      description: 'Configure Redux Toolkit with RTK Query for state management',
    },
    isDragging: false,
  },
};

export const LowPriorityTask: Story = {
  name: 'Low Priority Task',
  args: {
    task: {
      ...sampleTask,
      id: 3,
      priorityLevel: 'Low',
      taskName: 'Write unit tests',
      description: 'Add comprehensive test coverage for components',
      tags: ['testing', 'quality'],
    },
    isDragging: false,
  },
};

export const DraggingTask: Story = {
  name: 'Task Being Dragged',
  args: {
    task: {
      ...sampleTask,
      id: 4,
    },
    isDragging: true,
  },
};

export const MinimalTaskCard: Story = {
  name: 'Minimal Task (No Extras)',
  args: {
    task: {
      id: 5,
      taskName: 'Simple task without extras',
      priority: 1,
      swimLane: 1,
    },
    isDragging: false,
  },
};