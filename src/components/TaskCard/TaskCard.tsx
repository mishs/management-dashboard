import React from 'react';
import { Card, CardContent, Typography, Box, Chip } from '@mui/material';
import { DragIndicator } from '@mui/icons-material';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Task, PRIORITY_COLORS } from '../../types/task';

interface TaskCardProps {
  task: Task;
  swimLane: number;
  isDragging?: boolean;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, swimLane, isDragging = false }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: sortableIsDragging,
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
    opacity: isDragging || sortableIsDragging ? 0.5 : 1,
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      sx={{
        mb: 3,
        cursor: 'grab',
        backgroundColor: 'background.paper',
        border: '1px solid',
        borderColor: 'grey.200',
        '&:hover': {
          boxShadow: 3,
        },
        '&:active': {
          cursor: 'grabbing',
        },
      }}
      data-testid={`task-card-${task.id}`}
    >
      <CardContent sx={{ p: 4, '&:last-child': { pb: 4 } }}>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
          <Typography 
            variant="h4" 
            component="div" 
            sx={{ 
              flexGrow: 1, 
              color: 'grey.900',
              fontWeight: 500,
              fontSize: '0.875rem',
            }}
          >
            {task.taskName}
          </Typography>
          {task.priorityLevel && (
            <Chip
              label={task.priorityLevel}
              size="small"
              sx={{
                backgroundColor: PRIORITY_COLORS[task.priorityLevel],
                color: task.priorityLevel === 'Medium' ? 'grey.900' : 'white',
                fontWeight: 600,
                fontSize: '0.75rem',
                ml: 2,
              }}
            />
          )}
        </Box>

        {task.description && (
          <Typography 
            variant="body2" 
            sx={{ 
              mb: 3, 
              color: 'grey.600',
              fontSize: '0.75rem',
            }}
          >
            {task.description}
          </Typography>
        )}

        {task.assignee && (
          <Box display="flex" alignItems="center" mb={1}>
            <Box
              sx={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                backgroundColor: 'primary.main',
                mr: 1,
              }}
            />
            <Typography 
              variant="caption" 
              sx={{ 
                color: 'grey.600',
                fontSize: '0.75rem',
              }}
            >
              {task.assignee}
            </Typography>
          </Box>
        )}

        {task.dueDate && (
          <Typography 
            variant="caption" 
            sx={{ 
              color: 'grey.600',
              fontSize: '0.75rem',
              display: 'block',
              mb: 2,
            }}
          >
            Due: {formatDate(task.dueDate)}
          </Typography>
        )}

        {task.tags && task.tags.length > 0 && (
          <Box display="flex" flexWrap="wrap" gap={1} mb={2}>
            {task.tags.map((tag, index) => (
              <Chip
                key={index}
                label={tag}
                size="small"
                sx={{
                  backgroundColor: 'primary.light',
                  color: 'primary.main',
                  fontSize: '0.625rem',
                  height: 20,
                }}
              />
            ))}
          </Box>
        )}

        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography
            variant="caption"
            sx={{
              backgroundColor: 'grey.100',
              px: 1.5,
              py: 0.5,
              borderRadius: 1,
              color: 'text.secondary',
              fontSize: '0.75rem',
            }}
            data-testid={`task-priority-${task.id}`}
          >
            #{task.priority}
          </Typography>
          <DragIndicator sx={{ color: 'grey.300', fontSize: 16 }} />
        </Box>
      </CardContent>
    </Card>
  );
};