import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Box, Paper, Typography, Chip, Grid } from '@mui/material';
import { TaskCard } from '../TaskCard/TaskCard';
import { TaskWithSwimLane, LANE_NAMES, LANE_COLORS } from '../../types';
import { getLaneStats } from '../../utils/taskHelpers';

interface SwimLaneProps {
  laneId: 1 | 2 | 3;
  tasks: TaskWithSwimLane[];
}

export const SwimLane: React.FC<SwimLaneProps> = ({ laneId, tasks }) => {
  const { setNodeRef, isOver } = useDroppable({
    id: laneId.toString(),
  });

  const stats = getLaneStats(tasks);
  const laneColor = LANE_COLORS[laneId];
  const laneName = LANE_NAMES[laneId];

  return (
    <Box data-testid={`swim-lane-${laneId}`}>
      {/* Lane Header */}
      <Paper
        elevation={1}
        sx={{
          p: 2,
          mb: 2,
          backgroundColor: 'background.paper',
          border: '1px solid',
          borderColor: 'grey.200',
        }}
      >
        {/* Lane Title and Count */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box
              sx={{
                width: 12,
                height: 12,
                borderRadius: '50%',
                backgroundColor: laneColor,
              }}
            />
            <Typography variant="h2" component="h2">
              {laneName}
            </Typography>
          </Box>
          <Chip
            label={stats.total}
            size="small"
            sx={{
              backgroundColor: 'primary.main',
              color: 'white',
              fontWeight: 'medium',
            }}
            data-testid={`lane-task-count-${laneId}`}
          />
        </Box>

        {/* Priority Statistics */}
        <Grid container spacing={1}>
          <Grid item xs={4}>
            <Box
              sx={{
                backgroundColor: 'error.main',
                color: 'white',
                p: 1,
                borderRadius: 1,
                textAlign: 'center',
              }}
            >
              <Typography variant="caption" sx={{ fontSize: '0.75rem', fontWeight: 'medium' }}>
                High: {stats.high}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={4}>
            <Box
              sx={{
                backgroundColor: '#eab308',
                color: 'white',
                p: 1,
                borderRadius: 1,
                textAlign: 'center',
              }}
            >
              <Typography variant="caption" sx={{ fontSize: '0.75rem', fontWeight: 'medium' }}>
                Med: {stats.medium}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={4}>
            <Box
              sx={{
                backgroundColor: 'success.main',
                color: 'white',
                p: 1,
                borderRadius: 1,
                textAlign: 'center',
              }}
            >
              <Typography variant="caption" sx={{ fontSize: '0.75rem', fontWeight: 'medium' }}>
                Low: {stats.low}
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Drop Zone */}
      <Box
        ref={setNodeRef}
        data-testid={`drop-zone-${laneId}`}
        sx={{
          minHeight: 500,
          p: 2,
          border: '2px dashed',
          borderColor: isOver ? 'primary.main' : 'grey.300',
          backgroundColor: isOver ? 'primary.light' : 'grey.50',
          borderRadius: 2,
          transition: 'all 0.2s ease-in-out',
        }}
      >
        {tasks.length === 0 ? (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: 200,
              color: 'text.secondary',
            }}
            data-testid={`empty-lane-${laneId}`}
          >
            <Typography variant="body2">
              Drop tasks here
            </Typography>
          </Box>
        ) : (
          <SortableContext items={tasks.map(task => task.id.toString())} strategy={verticalListSortingStrategy}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {tasks
                .sort((a, b) => a.priority - b.priority)
                .map((task) => (
                  <TaskCard key={task.id} task={task} />
                ))}
            </Box>
          </SortableContext>
        )}
      </Box>
    </Box>
  );
};