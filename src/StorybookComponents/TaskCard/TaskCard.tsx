import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Chip,
  Box,
  Avatar,
  Stack,
} from '@mui/material';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Task, PRIORITY_COLORS } from '../../types/task';

interface TaskCardProps {
  task: Task;
  isDragging?: boolean;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, isDragging = false }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({
    id: task.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging || isSortableDragging ? 0.5 : 1,
  };

  const priorityColor = task.priorityLevel ? PRIORITY_COLORS[task.priorityLevel] : '#757575';

  return (
    <Card
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      sx={{
        cursor: 'grab',
        '&:hover': {
          boxShadow: 4,
        },
        '&:active': {
          cursor: 'grabbing',
        },
      }}
    >
      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="h4" component="h3" sx={{ flexGrow: 1, mr: 1 }}>
            {task.taskName}
          </Typography>
          {task.priorityLevel && (
            <Chip
              label={task.priorityLevel}
              size="small"
              sx={{
                backgroundColor: priorityColor,
                color: 'white',
                fontSize: '0.75rem',
                height: 20,
              }}
            />
          )}
        </Box>

        {task.description && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {task.description}
          </Typography>
        )}

        <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between">
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {task.assignee && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Avatar
                  sx={{
                    width: 24,
                    height: 24,
                    fontSize: '0.75rem',
                    bgcolor: 'primary.main',
                  }}
                >
                  {task.assignee.charAt(0)}
                </Avatar>
                <Typography variant="caption" color="text.secondary">
                  {task.assignee}
                </Typography>
              </Box>
            )}
          </Box>

          {task.dueDate && (
            <Typography variant="caption" color="text.secondary">
              Due: {new Date(task.dueDate).toLocaleDateString()}
            </Typography>
          )}
        </Stack>

        {task.tags && task.tags.length > 0 && (
          <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
            {task.tags.map((tag) => (
              <Chip
                key={tag}
                label={tag}
                size="small"
                variant="outlined"
                sx={{ fontSize: '0.7rem', height: 18 }}
              />
            ))}
          </Box>
        )}
      </CardContent>
    </Card>
  );
};