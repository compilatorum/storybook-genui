import type { Meta, StoryObj } from '@storybook/react'
import { Card } from './Card'

const meta = {
  title: 'Primitives/Card',
  component: Card,
  parameters: { layout: 'centered' },
  argTypes: {
    variant: { control: 'select', options: ['elevated', 'outlined', 'filled'] },
  },
} satisfies Meta<typeof Card>

export default meta
type Story = StoryObj<typeof meta>

export const Elevated: Story = {
  args: { title: 'Título do Card', children: 'Conteúdo do card em modo escuro.', variant: 'elevated' },
}

export const MobileDefault: Story = {
  args: { title: 'Mobile 360px', children: 'Teste em viewport mobile.', variant: 'outlined' },
  parameters: { viewport: { defaultViewport: 'mobile1' } },
}
