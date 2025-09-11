import type { Meta, StoryObj } from '@storybook/react';
import { Provider } from 'react-redux';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { Toaster } from 'sonner';
import { Dashboard } from './Dashboard';
import { store } from '../../../store';
import { theme } from '../../../theme';

const meta: Meta<typeof Dashboard> = {
  title: 'Dashboard/Dashboard',
  component: Dashboard,
  parameters: {
    layout: 'fullscreen',
  },
  decorators: [
    (Story) => (
      <Provider store={store}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <Story />
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