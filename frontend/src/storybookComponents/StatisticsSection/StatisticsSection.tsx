import React from 'react';
import { Box, Paper, Typography } from '@mui/material';
import { TaskWithSwimLane, LANE_NAMES, LANE_COLORS } from '@types';

interface StatisticsSectionProps {
  tasks: TaskWithSwimLane[];
}

export const StatisticsSection: React.FC<StatisticsSectionProps> = ({ tasks }) => {
  const totalTasks = tasks.length;
  const todoCount = tasks.filter(t => t.swimLane === 1).length;
  const inProgressCount = tasks.filter(t => t.swimLane === 2).length;
  const completedCount = tasks.filter(t => t.swimLane === 3).length;

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
        border: '1px solid',
        borderColor: 'grey.200',
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          backgroundColor: 'grey.100',
          transform: 'translateY(-2px)',
          boxShadow: 1,
        },
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
        backgroundColor: 'var(--mui-bg-paper)',
        border: '1px solid',
        borderColor: 'var(--gray-200)',
        borderRadius: 2,
        fontFamily: 'Inter, Roboto, sans-serif',
      }}
    >
      {/* Header */}
  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, fontFamily: 'Inter, Roboto, sans-serif' }}>
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
          variant="h3"
          component="h3"
          sx={{ fontWeight: 700, fontSize: '1.15rem', color: 'var(--mui-text-primary)', textShadow: '0 2px 8px rgba(0,0,0,0.12)', letterSpacing: '0.5px', mr: 2 }}
        >
          Live Dashboard Statistics
        </Typography>
      </Box>

      {/* Statistics Grid */}
          <Box sx={{ display: 'flex', gap: 3 }}>
            <Box sx={{ flex: 1 }}>
              <StatCard
                title="Total Tasks"
                value={totalTasks}
                color={LANE_COLORS[1]}
                testId="total-task-count"
              />
            </Box>
            <Box sx={{ flex: 1 }}>
              <StatCard
                title={LANE_NAMES[1]}
                value={todoCount}
                color={LANE_COLORS[1]}
                testId="lane-stat-1"
              />
            </Box>
            <Box sx={{ flex: 1 }}>
              <StatCard
                title={LANE_NAMES[2]}
                value={inProgressCount}
                color={LANE_COLORS[2]}
                testId="lane-stat-2"
              />
            </Box>
            <Box sx={{ flex: 1 }}>
              <StatCard
                title={LANE_NAMES[3]}
                value={completedCount}
                color={LANE_COLORS[3]}
                testId="lane-stat-3"
              />
            </Box>
          </Box>
    </Paper>
  );
};