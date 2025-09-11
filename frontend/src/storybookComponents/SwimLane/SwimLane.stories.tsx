import type { Meta, StoryObj } from '@storybook/react';
import { DndContext } from '@dnd-kit/core';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline, Box } from '@mui/material';
import { SwimLane } from './SwimLane';
import { theme } from '../../theme';
import { TaskWithSwimLane } from '../../types';

const sampleTasks: TaskWithSwimLane[] = [
  {
    id: 1,
    taskName: 'Design wireframes for dashboard',
    priority: 1,
    swimLane: 1,
    description: 'Create initial wireframes for the task management dashboard',
    assignee: 'Alex Chen',
    dueDate: '2024-12-15',
    tags: ['design', 'wireframes'],
    priorityLevel: 'High',
  },
  {
    id: 2,
    taskName: 'Implement drag and drop functionality',
    priority: 2,
    swimLane: 1,
    description: 'Add dnd-kit library and implement task reordering',
    assignee: 'Sarah Kim',
    dueDate: '2024-12-18',
    tags: ['development', 'frontend'],
    priorityLevel: 'High',
  },
];

const meta: Meta<typeof SwimLane> = {
  title: 'Components/SwimLane',
  component: SwimLane,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'Individual swim lane component that holds tasks and provides drop functionality.',
      },
    },
  },
  decorators: [
    (Story) => (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <DndContext onDragEnd={() => {}}>
          <Box sx={{ maxWidth: 400 }}>
            <Story />
          </Box>
        </DndContext>
      </ThemeProvider>
    ),
  ],
  argTypes: {
    laneId: {
      control: { type: 'select' },
      options: [1, 2, 3],
      description: 'Lane identifier (1=To Do, 2=In Progress, 3=Completed)',
    },
    tasks: {
      description: 'Array of tasks in this lane',
    },
  },
};

export default meta;
type Story = StoryObj<typeof SwimLane>;

export const TodoLane: Story = {
  args: {
    laneId: 1,
    tasks: sampleTasks,
  },
  name: 'To Do Lane',
};

export const InProgressLane: Story = {
  args: {
    laneId: 2,
    tasks: [],
  },
  name: 'In Progress Lane (Empty)',
};

export const CompletedLane: Story = {
  args: {
    laneId: 3,
    tasks: [sampleTasks[0]],
  },
  name: 'Completed Lane',
};