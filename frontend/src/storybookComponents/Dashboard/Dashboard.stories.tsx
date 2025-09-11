import type { Meta, StoryObj } from '@storybook/react';
import React, { Suspense } from 'react';
import { Provider } from 'react-redux';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline, CircularProgress, Box } from '@mui/material';
import { Toaster } from 'sonner';
import { Dashboard } from './Dashboard';
import { store } from '@store';
import { theme } from '@theme';
import ChunkErrorBoundary from '@components/ErrorBoundary';

// Loading component for Suspense
const LoadingSpinner = () => (
  <Box
    sx={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '400px',
    }}
  >
    <CircularProgress />
  </Box>
);

const meta: Meta<typeof Dashboard> = {
  title: 'Dashboard/Dashboard',
  component: Dashboard,
  parameters: {
    layout: 'fullscreen',
    docs: {
      source: {
        type: 'code',
      },
    },
  },
  decorators: [
    (Story) => (
      <Provider store={store}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <ChunkErrorBoundary>
            <Suspense fallback={<LoadingSpinner />}>
              <Story />
            </Suspense>
          </ChunkErrorBoundary>
          <Toaster position="top-right" richColors closeButton duration={4000} />
        </ThemeProvider>
      </Provider>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof Dashboard>;

export const DefaultDashboard: Story = {
  name: 'Default Dashboard View',
};

export const LoadingDashboard: Story = {
  name: 'Dashboard Loading State',
};