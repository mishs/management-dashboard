import React from 'react';
import { Box, Paper, Typography, Grid } from '@mui/material';
import { TaskWithSwimLane, LANE_NAMES, LANE_COLORS } from '../../types';

interface StatisticsSectionProps {
  tasks: { [key: number]: TaskWithSwimLane[] };
}

export const StatisticsSection: React.FC<StatisticsSectionProps> = ({ tasks }) => {
  const totalTasks = Object.values(tasks).reduce((sum, laneTasks) => sum + laneTasks.length, 0);
  const todoCount = tasks[1]?.length || 0;
  const inProgressCount = tasks[2]?.length || 0;
  const completedCount = tasks[3]?.length || 0;

  const StatCard: React.FC<{
    title: string;
    value: number;
    color: string;
    testId?: string;
  }> = ({ title, value, color, testId }) => (
    <Box
      sx={{
        backgroundColor: 'grey.50',
        p: 2,
        borderRadius: 2,
        textAlign: 'center',
      }}
      data-testid={testId}
    >
      <Typography
        variant="h3"
        component="div"
        sx={{
          fontSize: '1.5rem',
          fontWeight: 600,
          color: color,
          mb: 0.5,
        }}
      >
        {value}
      </Typography>
      <Typography
        variant="body2"
        color="text.secondary"
        sx={{ fontSize: '0.875rem' }}
      >
        {title}
      </Typography>
    </Box>
  );

  return (
    <Paper
      elevation={1}
      sx={{
        p: 3,
        mt: 4,
        backgroundColor: 'background.paper',
        border: '1px solid',
        borderColor: 'grey.200',
      }}
    >
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Box
          sx={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            backgroundColor: 'primary.main',
            mr: 1,
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
        <Typography
          variant="h2"
          component="h2"
          sx={{
            color: 'text.primary',
            fontWeight: 'medium',
          }}
        >
          Live Dashboard Statistics
        </Typography>
      </Box>

      {/* Statistics Grid */}
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Tasks"
            value={totalTasks}
            color={LANE_COLORS[1]}
            testId="total-task-count"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title={LANE_NAMES[1]}
            value={todoCount}
            color={LANE_COLORS[1]}
            testId="lane-stat-1"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title={LANE_NAMES[2]}
            value={inProgressCount}
            color={LANE_COLORS[2]}
            testId="lane-stat-2"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title={LANE_NAMES[3]}
            value={completedCount}
            color={LANE_COLORS[3]}
            testId="lane-stat-3"
          />
        </Grid>
      </Grid>
    </Paper>
  );
};