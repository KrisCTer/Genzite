import type { HTMLAttributes, ReactNode } from 'react'
import { cn } from '../utils/cn'

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'solid' | 'outline' | 'soft'
  color?: 'teal' | 'amber' | 'rose' | 'stone' | 'blue'
  size?: 'sm' | 'md'
  leftIcon?: ReactNode
}

const colorMap = {
  teal: {
    solid: 'bg-[var(--gz-primary-600)] text-white',
    outline: 'border border-[var(--gz-primary-300)] text-[var(--gz-primary-700)] bg-transparent',
    soft: 'bg-[var(--gz-primary-50)] text-[var(--gz-primary-700)]',
  },
  amber: {
    solid: 'bg-[var(--gz-accent-500)] text-white',
    outline: 'border border-[var(--gz-accent-300)] text-[var(--gz-accent-700)] bg-transparent',
    soft: 'bg-[var(--gz-accent-50)] text-[var(--gz-accent-700)]',
  },
  rose: {
    solid: 'bg-[var(--gz-danger-500)] text-white',
    outline: 'border border-rose-300 text-[var(--gz-danger-500)] bg-transparent',
    soft: 'bg-[var(--gz-danger-50)] text-[var(--gz-danger-500)]',
  },
  stone: {
    solid: 'bg-stone-600 text-white',
    outline: 'border border-[var(--gz-border)] text-[var(--gz-text-secondary)] bg-transparent',
    soft: 'bg-[var(--gz-surface-sunken)] text-[var(--gz-text-secondary)]',
  },
  blue: {
    solid: 'bg-[var(--gz-info-500)] text-white',
    outline: 'border border-blue-300 text-blue-700 bg-transparent',
    soft: 'bg-[var(--gz-info-50)] text-blue-700',
  },
}

const sizeStyles = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-xs',
}

export function Badge({
  variant = 'soft',
  color = 'teal',
  size = 'sm',
  leftIcon,
  className,
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 font-medium rounded-[var(--gz-radius-full)]',
        'whitespace-nowrap leading-none',
        colorMap[color][variant],
        sizeStyles[size],
        className,
      )}
      {...props}
    >
      {leftIcon}
      {children}
    </span>
  )
}
