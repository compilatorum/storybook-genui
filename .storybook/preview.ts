import type { Preview } from '@storybook/react'

const preview: Preview = {
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
      viewports: {
        mobile1: { name: 'Mobile S', styles: { width: '360px', height: '640px' } },
        mobile2: { name: 'Mobile L', styles: { width: '414px', height: '896px' } },
        tablet:  { name: 'Tablet',   styles: { width: '768px', height: '1024px' } },
        desktop: { name: 'Desktop',  styles: { width: '1280px', height: '800px' } },
      },
    },
    backgrounds: {
      default: 'dark',
      values: [
        { name: 'dark',  value: '#0a0a0f' },
        { name: 'light', value: '#f8f8ff' },
      ],
    },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
  },
}

export default preview
