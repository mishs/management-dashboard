import React from 'react';
import { Box, Typography, Paper, Grid } from '@mui/material';
import { TasksState, SWIM_LANE_LABELS, SWIM_LANE_COLORS } from '../../types/task';

interface StatisticsSectionProps {
  tasks: TasksState;
}

export const StatisticsSection: React.FC<StatisticsSectionProps> = ({ tasks }) => {
  const totalTasks = Object.values(tasks).reduce((sum, swimLaneTasks) => sum + swimLaneTasks.length, 0);

  const StatCard: React.FC<{ 
    label: string; 
    value: number; 
    color: string;
    testId?: string;
  }> = ({ label, value, color, testId }) => (
    <Box
      sx={{
        backgroundColor: 'grey.50',
        p: 4,
        borderRadius: 2,
        textAlign: 'center',
      }}
      data-testid={testId}
    >
      <Typography
        variant="h3"
        sx={{
          fontSize: '2rem',
          fontWeight: 600,
          color,
          mb: 1,
        }}
      >
        {value}
      </Typography>
      <Typography
        variant="body2"
        sx={{
          color: 'grey.600',
          fontSize: '0.875rem',
        }}
      >
        {label}
      </Typography>
    </Box>
  );

  return (
    <Paper
      elevation={1}
      sx={{
        p: 6,
        mt: 8,
        backgroundColor: 'background.paper',
        border: '1px solid',
        borderColor: 'grey.200',
      }}
    >
      <Box display="flex" alignItems="center" mb={4}>
        <Typography
          variant="h2"
          sx={{
            color: 'grey.900',
            fontWeight: 500,
            mr: 2,
          }}
        >
          Live Dashboard Statistics
        </Typography>
        <Box
          sx={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            backgroundColor: 'primary.main',
            animation: 'pulse 2s infinite',
            '@keyframes pulse': {
              '0%, 100%': {
                opacity: 1,
              },
              '50%': {
                opacity: 0.5,
              },
            },
          }}
        />
      </Box>

      <Grid container spacing={4}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            label="Total Tasks"
            value={totalTasks}
            color="#1976d2"
            testId="total-task-count"
          />
        </Grid>
        {Object.entries(tasks).map(([swimLaneId, swimLaneTasks]) => (
          <Grid item xs={12} sm={6} md={3} key={swimLaneId}>
            <StatCard
              label={SWIM_LANE_LABELS[parseInt(swimLaneId) as keyof typeof SWIM_LANE_LABELS]}
              value={swimLaneTasks.length}
              color={SWIM_LANE_COLORS[parseInt(swimLaneId) as keyof typeof SWIM_LANE_COLORS]}
              testId={`lane-stat-${swimLaneId}`}
            />
          </Grid>
        ))}
      </Grid>
    </Paper>
  );
};