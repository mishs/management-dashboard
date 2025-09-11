import type { Meta, StoryObj } from '@storybook/react';
import { DndContext } from '@dnd-kit/core';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline, Box } from '@mui/material';
import { SwimLane } from './SwimLane';
import { theme } from '../../../theme';
import { TaskWithSwimLane } from '../../../types';

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
  title: 'Dashboard/SwimLane',
  component: SwimLane,
  parameters: {
    layout: 'padded',
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
};

export default meta;
type Story = StoryObj<typeof SwimLane>;

export const TodoLaneWithTasks: Story = {
  name: 'To Do Lane (With Tasks)',
  args: {
    laneId: 1,
    tasks: sampleTasks,
  },
};

export const InProgressLaneEmpty: Story = {
  name: 'In Progress Lane (Empty)',
  args: {
    laneId: 2,
    tasks: [],
  },
};

export const CompletedLaneWithOneTask: Story = {
  name: 'Completed Lane (One Task)',
  args: {
    laneId: 3,
    tasks: [sampleTasks[0]],
  },
};