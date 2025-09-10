import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { TaskCard } from '../TaskCard/TaskCard';
import { Task, SwimLane as SwimLaneEnum, SWIM_LANE_LABELS } from '../../types/task';

interface SwimLaneProps {
  swimLane: SwimLaneEnum;
  tasks: Task[];
}

export const SwimLane: React.FC<SwimLaneProps> = ({ swimLane, tasks }) => {
  const { setNodeRef, isOver } = useDroppable({
    id: `swimlane-${swimLane}`,
    data: {
      type: 'swimlane',
      swimLane,
    },
  });

  const taskIds = tasks.map(task => `${swimLane}-${task.id}`);

  return (
    <Paper
      elevation={2}
      sx={{
        p: 2,
        minHeight: 400,
        backgroundColor: isOver ? 'grey.50' : 'background.paper',
        transition: 'background-color 0.2s ease',
      }}
    >
      <Typography
        variant="h6"
        component="h2"
        sx={{
          mb: 2,
          fontWeight: 600,
          color: 'text.primary',
          textAlign: 'center',
        }}
      >
        {SWIM_LANE_LABELS[swimLane]}
        <Typography
          component="span"
          variant="body2"
          sx={{
            ml: 1,
            color: 'text.secondary',
            fontWeight: 400,
          }}
        >
          ({tasks.length})
        </Typography>
      </Typography>
      
      <Box ref={setNodeRef} sx={{ minHeight: 300 }}>
        <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} swimLane={swimLane} />
          ))}
        </SortableContext>
        
        {tasks.length === 0 && (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: 200,
              border: '2px dashed',
              borderColor: 'grey.300',
              borderRadius: 1,
              color: 'text.secondary',
            }}
          >
            <Typography variant="body2">
              Drop tasks here
            </Typography>
          </Box>
        )}
      </Box>
    </Paper>
  );
};