import React from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  LinearProgress,
} from '@mui/material';
import {
  Assignment,
  PlayArrow,
  CheckCircle,
  TrendingUp,
} from '@mui/icons-material';
import { Task, SwimLane } from '../../types/task';

interface StatisticsSectionProps {
  tasks: Record<SwimLane, Task[]>;
}

export const StatisticsSection: React.FC<StatisticsSectionProps> = ({ tasks }) => {
  const todoCount = tasks[SwimLane.TODO]?.length || 0;
  const inProgressCount = tasks[SwimLane.IN_PROGRESS]?.length || 0;
  const completedCount = tasks[SwimLane.COMPLETED]?.length || 0;
  const totalTasks = todoCount + inProgressCount + completedCount;
  
  const completionRate = totalTasks > 0 ? (completedCount / totalTasks) * 100 : 0;

  const stats = [
    {
      title: 'To Do',
      value: todoCount,
      icon: Assignment,
      color: '#1976d2',
    },
    {
      title: 'In Progress',
      value: inProgressCount,
      icon: PlayArrow,
      color: '#ff9800',
    },
    {
      title: 'Completed',
      value: completedCount,
      icon: CheckCircle,
      color: '#2e7d32',
    },
    {
      title: 'Total Tasks',
      value: totalTasks,
      icon: TrendingUp,
      color: '#9c27b0',
    },
  ];

  return (
    <Box sx={{ mb: 4 }}>
      <Grid container spacing={3}>
        {stats.map((stat) => {
          const IconComponent = stat.icon;
          return (
            <Grid item xs={12} sm={6} md={3} key={stat.title}>
              <Paper
                elevation={1}
                sx={{
                  p: 3,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                  height: '100%',
                }}
              >
                <Box
                  sx={{
                    p: 1.5,
                    borderRadius: 2,
                    backgroundColor: `${stat.color}20`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <IconComponent sx={{ color: stat.color, fontSize: 28 }} />
                </Box>
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="h2" component="div" sx={{ color: stat.color }}>
                    {stat.value}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {stat.title}
                  </Typography>
                </Box>
              </Paper>
            </Grid>
          );
        })}
      </Grid>

      {totalTasks > 0 && (
        <Paper elevation={1} sx={{ p: 3, mt: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h4">Progress Overview</Typography>
            <Typography variant="h4" sx={{ color: 'primary.main' }}>
              {Math.round(completionRate)}%
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={completionRate}
            sx={{
              height: 8,
              borderRadius: 4,
              backgroundColor: 'grey.200',
              '& .MuiLinearProgress-bar': {
                borderRadius: 4,
                backgroundColor: '#2e7d32',
              },
            }}
          />
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            {completedCount} of {totalTasks} tasks completed
          </Typography>
        </Paper>
      )}
    </Box>
  );
};