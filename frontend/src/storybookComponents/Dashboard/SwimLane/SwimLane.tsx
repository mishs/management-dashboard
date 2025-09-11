import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Box, Paper, Typography, Chip, Grid } from '@mui/material';
import { TaskCard } from '../TaskCard/TaskCard';
import { TaskWithSwimLane, LANE_NAMES, LANE_COLORS } from '../../../types';
import { getLaneStats } from '../../../utils/taskHelpers';

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
          backgroundColor: 'var(--mui-bg-paper)',
          border: '1px solid',
          borderColor: 'var(--gray-200)',
          borderRadius: 2,
          fontFamily: 'Inter, Roboto, sans-serif',
        }}
      >
        {/* Lane Title and Count */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2, fontFamily: 'Inter, Roboto, sans-serif', gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box
              sx={{
                width: 12,
                height: 12,
                borderRadius: '50%',
                backgroundColor: laneColor,
              }}
            />
            <Typography variant="h2" component="h2" sx={{ fontSize: '1.24rem', fontWeight: 600, color: 'var(--gray-950)', letterSpacing: '0.5px', textShadow: '0 1px 2px rgba(0,0,0,0.08)', fontFamily: 'Inter, Roboto, sans-serif' }}>
              {laneName}
            </Typography>
          </Box>
          <Chip
            label={stats.total}
            size="small"
            sx={{
              backgroundColor: 'var(--mui-primary)',
              color: 'var(--mui-bg-paper)',
              fontWeight: 700,
              fontSize: '1.05rem',
              minWidth: 40,
              height: 28,
              borderRadius: '9999px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
              fontFamily: 'Inter, Roboto, sans-serif',
              letterSpacing: '0.5px',
            }}
            data-testid={`lane-task-count-${laneId}`}
          />
        </Box>

        {/* Priority Statistics */}
        <Grid container spacing={1}>
          <Grid columns={3}>
            <Box
              sx={{
                backgroundColor: 'error.main',
                color: 'white',
                p: 1,
                borderRadius: 1,
                textAlign: 'center',
                minHeight: 32,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Typography variant="caption" sx={{ fontSize: '0.75rem', fontWeight: 'medium' }}>
                High: {stats.high}
              </Typography>
            </Box>
          </Grid>
          <Grid columns={3}>
            <Box
              sx={{
                backgroundColor: '#eab308',
                color: 'white',
                p: 1,
                borderRadius: 1,
                textAlign: 'center',
                minHeight: 32,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Typography variant="caption" sx={{ fontSize: '0.75rem', fontWeight: 'medium' }}>
                Med: {stats.medium}
              </Typography>
            </Box>
          </Grid>
          <Grid columns={3}>
            <Box
              sx={{
                backgroundColor: 'success.main',
                color: 'white',
                p: 1,
                borderRadius: 1,
                textAlign: 'center',
                minHeight: 32,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
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
          '&:hover': {
            borderColor: isOver ? 'primary.main' : 'grey.400',
          },
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
              flexDirection: 'column',
              gap: 1,
            }}
            data-testid={`empty-lane-${laneId}`}
          >
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: '50%',
                backgroundColor: 'grey.200',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 1,
              }}
            >
              <Typography variant="h4" color="text.secondary">
                +
              </Typography>
            </Box>
            <Typography variant="body2">
              Drop tasks here
            </Typography>
          </Box>
        ) : (
          <SortableContext items={tasks.map(task => task.id.toString())} strategy={verticalListSortingStrategy}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {tasks.map((task) => (
                <TaskCard key={task.id} task={task} />
              ))}
            </Box>
          </SortableContext>
        )}
      </Box>
    </Box>
  );
};

export default SwimLane;