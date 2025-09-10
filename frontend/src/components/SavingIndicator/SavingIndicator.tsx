import React from 'react';
import { Box, Typography, CircularProgress } from '@mui/material';

export const SavingIndicator: React.FC = () => {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        mt: 1,
        color: 'primary.main',
      }}
      data-testid="saving-indicator"
    >
      <CircularProgress
        size={16}
        thickness={4}
        sx={{
          mr: 1,
          color: 'primary.main',
        }}
      />
      <Typography
        variant="body2"
        sx={{
          fontSize: '0.875rem',
          color: 'primary.main',
        }}
      >
        Saving changes...
      </Typography>
    </Box>
  );
};