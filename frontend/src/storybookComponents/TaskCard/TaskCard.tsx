import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { Box, Card, CardContent, Typography, Chip, Stack } from '@mui/material';
import { DragIndicator } from '@mui/icons-material';
import { TaskWithSwimLane } from '../../types';
import { formatDate } from '../../utils/taskHelpers';

interface TaskCardProps {
  task: TaskWithSwimLane;
  isDragging?: boolean;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, isDragging = false }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging: isActiveDragging,
  } = useDraggable({
    id: task.id.toString(),
    data: { task },
  });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        opacity: isDragging || isActiveDragging ? 0.5 : 1,
        zIndex: isDragging || isActiveDragging ? 1000 : 'auto',
        fontFamily: 'Inter, Roboto, sans-serif',
        boxShadow: isDragging ? '0 4px 16px rgba(0,0,0,0.10)' : '0 2px 8px rgba(0,0,0,0.04)',
        border: '1.5px solid var(--gray-200)',
        borderRadius: '12px',
      }
    : {
        fontFamily: 'Inter, Roboto, sans-serif',
        boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
        border: '1.5px solid var(--gray-200)',
        borderRadius: '12px',
      };

  const getPriorityColor = (priority: string | undefined) => {
    switch (priority) {
      case 'High':
        return { backgroundColor: 'var(--priority-high-bg)', color: 'var(--priority-high-text)' };
      case 'Medium':
        return { backgroundColor: 'var(--priority-medium-bg)', color: 'var(--priority-medium-text)' };
      case 'Low':
        return { backgroundColor: 'var(--priority-low-bg)', color: 'var(--priority-low-text)' };
      default:
        return { backgroundColor: 'var(--gray-500)', color: 'var(--priority-high-text)' };
    }
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      data-testid={`task-card-${task.id}`}
      sx={{
        cursor: isDragging ? 'grabbing' : 'grab',
        backgroundColor: 'background.paper',
        border: '1px solid',
        borderColor: 'grey.200',
        transition: 'box-shadow 0.2s ease-in-out',
        borderRadius: 2,
        '&:hover': {
          boxShadow: 2,
          borderColor: 'primary.light',
        },
        '&:active': {
          transform: 'scale(1.02)',
        },
      }}
    >
  <CardContent sx={{ p: 3, '&:last-child': { pb: 3 }, fontFamily: 'Inter, Roboto, sans-serif', gap: 2 }}>
        {/* Header Row */}
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
          {/* Grip Handle */}
          <Box sx={{ width: 16, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', mr: 1 }}>
            <Box sx={{ width: 4, height: 24, borderRadius: 2, background: 'var(--gray-300)', opacity: 0.7 }} />
          </Box>
          <Typography
            variant="body2"
            component="h3"
            sx={{
              fontWeight: 600,
              color: 'var(--gray-950)',
              fontSize: '0.96rem',
              textShadow: '0 1px 2px rgba(0,0,0,0.08)',
              flex: 1,
              mr: 1,
              lineHeight: 1.4,
            }}
          >
            {task.taskName}
          </Typography>
          {task.priorityLevel && (
            <Chip
              label={task.priorityLevel}
              size="small"
              sx={{
                ...getPriorityColor(task.priorityLevel),
                fontSize: '0.75rem',
                height: 20,
                borderRadius: 1,
                '& .MuiChip-label': {
                  px: 1,
                },
              }}
            />
          )}
        </Box>

        {/* Description */}
        {task.description && (
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{
              fontSize: '0.75rem',
              lineHeight: 1.4,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              mb: 1.5,
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
            }}
          >
            {task.description}
          </Typography>
        )}

        {/* Assignee */}
        {task.assignee && (
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Box
              sx={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                backgroundColor: 'primary.main',
                mr: 1,
              }}
            />
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
              {task.assignee}
            </Typography>
          </Box>
        )}

        {/* Due Date */}
        {task.dueDate && (
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1.5, fontSize: '0.75rem' }}>
            Due: {formatDate(task.dueDate)}
          </Typography>
        )}

        {/* Tags */}
        {task.tags && task.tags.length > 0 && (
          <Stack direction="row" spacing={0.5} sx={{ mb: 1.5, flexWrap: 'wrap', gap: 0.5 }}>
            {task.tags.map((tag, index) => (
              <Chip
                key={index}
                label={tag}
                size="small"
                sx={{
                  backgroundColor: 'primary.main',
                  color: 'white',
                  fontSize: '0.625rem',
                  height: 18,
                  borderRadius: 1,
                  '& .MuiChip-label': {
                    px: 0.75,
                  },
                }}
              />
            ))}
          </Stack>
        )}

        {/* Footer */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ fontSize: '0.75rem' }}
            data-testid={`task-priority-${task.id}`}
          >
            Priority: {task.priority}
          </Typography>
          <DragIndicator 
            sx={{ 
              color: 'grey.400', 
              fontSize: 16,
              transition: 'color 0.2s ease-in-out',
              '&:hover': {
                color: 'primary.main',
              },
            }} 
          />
        </Box>
      </CardContent>
    </Card>
  );
};