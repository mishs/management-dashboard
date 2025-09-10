import React from 'react';
import { Box, Typography, CircularProgress } from '@mui/material';

export const SavingIndicator: React.FC = () => {
  return (
    <Box 
      display="flex" 
      alignItems="center" 
      justifyContent="center" 
      mt={2}
      data-testid="saving-indicator"
    >
      <CircularProgress 
        size={16} 
        sx={{ 
          color: 'primary.main',
          mr: 1,
        }} 
      />
      <Typography 
        variant="body2" 
        sx={{ 
          color: 'primary.main',
          fontWeight: 500,
        }}
      >
        Saving changes...
      </Typography>
    </Box>
  );
};