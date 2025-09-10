import React from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Task } from '../../types/task';

interface TaskCardProps {
  task: Task;
  swimLane: number;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, swimLane }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: `${swimLane}-${task.id}`,
    data: {
      type: 'task',
      task,
      swimLane,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      sx={{
        mb: 2,
        cursor: 'grab',
        '&:hover': {
          boxShadow: 3,
        },
        '&:active': {
          cursor: 'grabbing',
        },
      }}
    >
      <CardContent sx={{ py: 2, '&:last-child': { pb: 2 } }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="body1" component="div" sx={{ flexGrow: 1 }}>
            {task.taskName}
          </Typography>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{
              backgroundColor: 'grey.100',
              px: 1,
              py: 0.5,
              borderRadius: 1,
              ml: 1,
            }}
          >
            #{task.priority}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};