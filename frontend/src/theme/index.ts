import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
      light: '#e3f2fd',
      dark: '#1565c0',
    },
    secondary: {
      main: '#9c27b0',
      light: '#f3e5f5',
      dark: '#7b1fa2',
    },
    success: {
      main: '#2e7d32',
      light: '#e8f5e8',
      dark: '#1b5e20',
    },
    error: {
      main: '#d32f2f',
      light: '#ffebee',
      dark: '#c62828',
    },
    warning: {
      main: '#ff9800',
      light: '#fff3e0',
      dark: '#f57c00',
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff',
    },
    text: {
      primary: '#212121',
      secondary: '#757575',
    },
  },
  typography: {
    fontFamily: '"Inter", system-ui, Avenir, Helvetica, Arial, sans-serif',
    h1: {
      fontSize: '1.5rem',
      fontWeight: 600,
      color: '#212121',
    },
    h2: {
      fontSize: '1.125rem',
      fontWeight: 500,
      color: '#212121',
    },
    h4: {
      fontSize: '1rem',
      fontWeight: 500,
      color: '#212121',
    },
    body1: {
      fontSize: '1rem',
      fontWeight: 400,
      color: '#212121',
    },
    body2: {
      fontSize: '0.875rem',
      fontWeight: 400,
      color: '#757575',
    },
    caption: {
      fontSize: '0.75rem',
      fontWeight: 400,
      color: '#757575',
    },
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
          '&:hover': {
            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: '0.25rem',
        },
      },
    },
  },
});