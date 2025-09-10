import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Chip,
  Stack,
} from '@mui/material';
import { useDroppable } from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { TaskCard } from '../TaskCard/TaskCard';
import { Task, SwimLane as SwimLaneEnum } from '../../types/task';

interface SwimLaneProps {
  id: SwimLaneEnum;
  title: string;
  tasks: Task[];
  color: string;
}

export const SwimLane: React.FC<SwimLaneProps> = ({
  id,
  title,
  tasks,
  color,
}) => {
  const { setNodeRef, isOver } = useDroppable({
    id: `swimlane-${id}`,
  });

  return (
    <Paper
      ref={setNodeRef}
      elevation={1}
      sx={{
        p: 2,
        minHeight: 400,
        backgroundColor: isOver ? 'action.hover' : 'background.paper',
        border: isOver ? `2px dashed ${color}` : '1px solid',
        borderColor: isOver ? color : 'divider',
        transition: 'all 0.2s ease-in-out',
      }}
    >
      <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="h2" component="h2" sx={{ color }}>
          {title}
        </Typography>
        <Chip
          label={tasks.length}
          size="small"
          sx={{
            backgroundColor: color,
            color: 'white',
            fontWeight: 'bold',
          }}
        />
      </Box>

      <SortableContext items={tasks.map(task => task.id)} strategy={verticalListSortingStrategy}>
        <Stack spacing={2}>
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))}
        </Stack>
      </SortableContext>

      {tasks.length === 0 && (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: 200,
            color: 'text.secondary',
            fontStyle: 'italic',
          }}
        >
          Drop tasks here
        </Box>
      )}
    </Paper>
  );
};