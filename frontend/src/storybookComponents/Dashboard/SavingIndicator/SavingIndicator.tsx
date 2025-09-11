import React from 'react';
import { Box, Typography, CircularProgress } from '@mui/material';

export const SavingIndicator: React.FC = () => {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        mt: 1,
        color: 'var(--mui-primary)',
        fontFamily: 'Inter, Roboto, sans-serif',
      }}
      data-testid="saving-indicator"
    >
      <CircularProgress
        size={16}
        thickness={4}
        sx={{
          mr: 1,
          color: 'var(--mui-primary)',
        }}
      />
      <Typography
        variant="body2"
        sx={{
          fontSize: '0.96rem',
          color: 'var(--mui-primary)',
          fontWeight: 600,
          textShadow: '0 1px 2px rgba(0,0,0,0.08)',
          fontFamily: 'Inter, Roboto, sans-serif',
        }}
      >
        Saving changes...
      </Typography>
    </Box>
  );
};