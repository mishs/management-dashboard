import React from 'react';
import { Box, Typography, Paper, Chip, Grid } from '@mui/material';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { TaskCard } from '../TaskCard/TaskCard';
import { Task, SwimLane as SwimLaneEnum, SWIM_LANE_LABELS, SWIM_LANE_COLORS } from '../../types/task';

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
  
  const priorityCounts = {
    High: tasks.filter(task => task.priorityLevel === 'High').length,
    Medium: tasks.filter(task => task.priorityLevel === 'Medium').length,
    Low: tasks.filter(task => task.priorityLevel === 'Low').length,
  };

  return (
    <Box data-testid={`swim-lane-${swimLane}`}>
      <Paper
        elevation={1}
        sx={{
          p: 4,
          mb: 3,
          backgroundColor: 'background.paper',
          border: '1px solid',
          borderColor: 'grey.200',
        }}
      >
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Box display="flex" alignItems="center" gap={1.5}>
            <Box
              sx={{
                width: 12,
                height: 12,
                borderRadius: '50%',
                backgroundColor: SWIM_LANE_COLORS[swimLane],
              }}
            />
            <Typography variant="h2" component="h2">
              {SWIM_LANE_LABELS[swimLane]}
            </Typography>
          </Box>
          <Chip
            label={tasks.length}
            size="small"
            sx={{
              backgroundColor: 'primary.main',
              color: 'white',
              fontWeight: 600,
              minWidth: 32,
            }}
            data-testid={`lane-task-count-${swimLane}`}
          />
        </Box>

        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={4}>
            <Box
              sx={{
                backgroundColor: 'error.main',
                color: 'white',
                p: 1.5,
                borderRadius: 1,
                textAlign: 'center',
              }}
            >
              <Typography variant="body2" sx={{ fontSize: '0.75rem', fontWeight: 600 }}>
                High: {priorityCounts.High}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={4}>
            <Box
              sx={{
                backgroundColor: '#eab308',
                color: 'white',
                p: 1.5,
                borderRadius: 1,
                textAlign: 'center',
              }}
            >
              <Typography variant="body2" sx={{ fontSize: '0.75rem', fontWeight: 600 }}>
                Med: {priorityCounts.Medium}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={4}>
            <Box
              sx={{
                backgroundColor: 'success.main',
                color: 'white',
                p: 1.5,
                borderRadius: 1,
                textAlign: 'center',
              }}
            >
              <Typography variant="body2" sx={{ fontSize: '0.75rem', fontWeight: 600 }}>
                Low: {priorityCounts.Low}
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      <Paper
        elevation={0}
        sx={{
          minHeight: 500,
          p: 4,
          backgroundColor: isOver ? 'primary.light' : 'grey.50',
          border: '2px dashed',
          borderColor: isOver ? 'primary.main' : 'grey.300',
          borderRadius: 2,
          transition: 'all 0.2s ease',
        }}
        data-testid={`drop-zone-${swimLane}`}
      >
        <Box ref={setNodeRef} sx={{ minHeight: 400 }}>
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
                height: 300,
                color: 'text.secondary',
              }}
              data-testid={`empty-lane-${swimLane}`}
            >
              <Typography variant="body2">
                Drop tasks here
              </Typography>
            </Box>
          )}
        </Box>
      </Paper>
    </Box>
  );
};