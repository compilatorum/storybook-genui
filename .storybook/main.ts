import type { StorybookConfig } from '@storybook/react-vite'

const config: StorybookConfig = {
  stories: [
    '../packages/*/src/**/*.stories.@(ts|tsx)',
    '../apps/*/src/**/*.stories.@(ts|tsx)',
  ],
  addons: [
    '@storybook/addon-viewport',
    '@storybook/addon-designs',
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
  refs: {
    ui: { title: 'UI', url: 'http://localhost:6007' },
    'gen-ui': { title: 'GenUI', url: 'http://localhost:6008' },
  },
}

export default config
