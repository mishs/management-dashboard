import type { Meta, StoryObj } from '@storybook/react';
import { Dashboard } from './Dashboard';
import { Provider } from 'react-redux';
import { store } from '../../store';

const meta: Meta<typeof Dashboard> = {
  title: 'Components/Dashboard',
  component: Dashboard,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <Provider store={store}>
        <Story />
      </Provider>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithMockData: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Dashboard with sample task data loaded from the mock API.',
      },
    },
  },
};