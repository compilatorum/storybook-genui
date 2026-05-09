import type { ReactNode } from 'react'

export interface CardProps {
  title: string
  children?: ReactNode
  variant?: 'elevated' | 'outlined' | 'filled'
}

const variantStyles = {
  elevated: { background: '#1a1a2e', boxShadow: '0 4px 12px rgba(0,0,0,0.4)', borderRadius: 12, padding: 16 },
  outlined: { border: '1px solid #333', borderRadius: 12, padding: 16 },
  filled: { background: '#16213e', borderRadius: 12, padding: 16 },
} as const

export function Card({ title, children, variant = 'elevated' }: CardProps) {
  return (
    <div style={variantStyles[variant]}>
      <h2 style={{ margin: '0 0 8px', fontSize: '1.125rem', color: '#e0e0e0' }}>{title}</h2>
      <div style={{ color: '#aaa', fontSize: '0.875rem' }}>{children}</div>
    </div>
  )
}
