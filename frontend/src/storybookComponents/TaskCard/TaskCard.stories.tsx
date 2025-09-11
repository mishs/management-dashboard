import type { Meta, StoryObj } from '@storybook/react';
import { DndContext } from '@dnd-kit/core';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline, Box } from '@mui/material';
import { TaskCard } from './TaskCard';
import { theme } from '../../theme';
import { TaskWithSwimLane } from '../../types';

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
  title: 'Components/TaskCard',
  component: TaskCard,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'Individual task card component with drag functionality and task details.',
      },
    },
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
  argTypes: {
    task: {
      description: 'Task object with all task details',
    },
    isDragging: {
      control: 'boolean',
      description: 'Whether the task is currently being dragged',
    },
  },
};

export default meta;
type Story = StoryObj<typeof TaskCard>;

export const HighPriority: Story = {
  args: {
    task: sampleTask,
    isDragging: false,
  },
  name: 'High Priority Task',
};

export const MediumPriority: Story = {
  args: {
    task: {
      ...sampleTask,
      priorityLevel: 'Medium',
      taskName: 'Set up Redux store',
      description: 'Configure Redux Toolkit with RTK Query for state management',
    },
    isDragging: false,
  },
  name: 'Medium Priority Task',
};

export const LowPriority: Story = {
  args: {
    task: {
      ...sampleTask,
      priorityLevel: 'Low',
      taskName: 'Write unit tests',
      description: 'Add comprehensive test coverage for components',
      tags: ['testing', 'quality'],
    },
    isDragging: false,
  },
  name: 'Low Priority Task',
};

export const Dragging: Story = {
  args: {
    task: sampleTask,
    isDragging: true,
  },
  name: 'Dragging State',
};

export const MinimalTask: Story = {
  args: {
    task: {
      id: 2,
      taskName: 'Simple task without extras',
      priority: 1,
      swimLane: 1,
    },
    isDragging: false,
  },
  name: 'Minimal Task',
};