import type { StorybookConfig } from '@storybook/react-vite'

const config: StorybookConfig = {
  stories: [
    '../packages/*/src/**/*.stories.@(ts|tsx)',
    '../apps/*/src/**/*.stories.@(ts|tsx)',
  ],
  addons: [
    '@storybook/addon-viewport',
    '@storybook/addon-interactions',
    '@storybook/addon-a11y',
  ],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  docs: {
    autodocs: true,
  },
}

export default config
