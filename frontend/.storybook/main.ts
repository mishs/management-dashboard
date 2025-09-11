import type { StorybookConfig } from '@storybook/react-vite';
import path from 'path';

const config: StorybookConfig = {
  stories: [
    '../src/**/*.mdx',
    '../src/**/*.stories.@(js|jsx|ts|tsx)',
    '../src/**/*.story.@(js|jsx|ts|tsx)',
    '../src/storybookComponents/**/*.stories.@(js|jsx|ts|tsx)',
    '../src/storybookComponents/**/*.story.@(js|jsx|ts|tsx)',
  ],
  addons: [
    '@storybook/addon-links',
    '@storybook/addon-essentials',
    '@storybook/addon-interactions',
  ],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  core: {
    builder: '@storybook/builder-vite',
  },
  viteFinal: async (config) => {
    // Add Vite aliases for Storybook
    config.resolve = config.resolve || {};
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve(__dirname, '../src'),
      '@store': path.resolve(__dirname, '../src/store'),
      '@theme': path.resolve(__dirname, '../src/theme'),
      '@components': path.resolve(__dirname, '../src/components'),
      '@storybookComponents': path.resolve(__dirname, '../src/storybookComponents'),
      '@types': path.resolve(__dirname, '../src/types'),
      '@utils': path.resolve(__dirname, '../src/utils'),
      '@hooks': path.resolve(__dirname, '../src/hooks'),
    };
    
    // Optimize build for better reliability
    config.build = {
      ...config.build,
      rollupOptions: {
        output: {
          manualChunks: undefined,
        },
      },
    };
    
    return config;
  },
  typescript: {
    check: false,
    reactDocgen: 'react-docgen-typescript',
    reactDocgenTypescriptOptions: {
      shouldExtractLiteralValuesFromEnum: true,
      propFilter: (prop) => (prop.parent ? !/node_modules/.test(prop.parent.fileName) : true),
    },
  },
};

export default config;