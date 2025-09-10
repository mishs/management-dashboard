import type { Meta, StoryObj } from '@storybook/react';
import { Provider } from 'react-redux';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { Toaster } from 'sonner';
import { Dashboard } from './Dashboard';
import { store } from '../../store';
import { theme } from '../../theme';

const meta: Meta<typeof Dashboard> = {
  title: 'Components/Dashboard',
  component: Dashboard,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Main task dashboard with drag-and-drop functionality across three swim lanes.',
      },
    },
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

export const Default: Story = {
  name: 'Default Dashboard',
  parameters: {
    docs: {
      description: {
        story: 'The default dashboard view with tasks loaded from the mock API.',
      },
    },
  },
};

export const Loading: Story = {
  name: 'Loading State',
  parameters: {
    docs: {
      description: {
        story: 'Dashboard in loading state while fetching tasks.',
      },
    },
    msw: {
      handlers: [
        // Mock delayed response
      ],
    },
  },
};