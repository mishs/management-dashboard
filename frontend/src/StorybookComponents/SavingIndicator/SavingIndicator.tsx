import React from 'react';
import {
  Box,
  Paper,
  Typography,
  CircularProgress,
  Fade,
} from '@mui/material';
import { CheckCircle } from '@mui/icons-material';

interface SavingIndicatorProps {
  isVisible: boolean;
}

export const SavingIndicator: React.FC<SavingIndicatorProps> = ({ isVisible }) => {
  const [showSuccess, setShowSuccess] = React.useState(false);

  React.useEffect(() => {
    if (!isVisible && showSuccess) {
      const timer = setTimeout(() => {
        setShowSuccess(false);
      }, 2000);
      return () => clearTimeout(timer);
    } else if (isVisible) {
      setShowSuccess(false);
    }
  }, [isVisible, showSuccess]);

  React.useEffect(() => {
    if (!isVisible) {
      setShowSuccess(true);
    }
  }, [isVisible]);

  if (!isVisible && !showSuccess) {
    return null;
  }

  return (
    <Fade in={isVisible || showSuccess}>
      <Paper
        elevation={4}
        sx={{
          position: 'fixed',
          top: 24,
          right: 24,
          p: 2,
          zIndex: 1300,
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          backgroundColor: isVisible ? 'background.paper' : 'success.light',
          border: isVisible ? '1px solid' : '1px solid',
          borderColor: isVisible ? 'divider' : 'success.main',
        }}
      >
        {isVisible ? (
          <>
            <CircularProgress size={20} />
            <Typography variant="body2">Saving changes...</Typography>
          </>
        ) : (
          <>
            <CheckCircle sx={{ color: 'success.main', fontSize: 20 }} />
            <Typography variant="body2" sx={{ color: 'success.main' }}>
              Changes saved!
            </Typography>
          </>
        )}
      </Paper>
    </Fade>
  );
};