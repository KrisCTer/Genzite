import type { ReactNode } from 'react'
import { cn } from '../utils/cn'

export interface PageWrapperProps {
  title?: string
  description?: string
  actions?: ReactNode
  children: ReactNode
  className?: string
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
}

const maxWidthStyles = {
  sm: 'max-w-2xl',
  md: 'max-w-4xl',
  lg: 'max-w-6xl',
  xl: 'max-w-7xl',
  full: 'max-w-full',
}

export function PageWrapper({
  title,
  description,
  actions,
  children,
  className,
  maxWidth = 'xl',
}: PageWrapperProps) {
  return (
    <div className={cn('mx-auto px-6 py-8', maxWidthStyles[maxWidth], className)}>
      {(title || actions) && (
        <div className="flex items-start justify-between gap-4 mb-8">
          <div>
            {title && (
              <h1 className="text-xl font-semibold text-[var(--gz-text)] tracking-tight">
                {title}
              </h1>
            )}
            {description && (
              <p className="mt-1 text-sm text-[var(--gz-text-secondary)]">
                {description}
              </p>
            )}
          </div>
          {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
        </div>
      )}
      {children}
    </div>
  )
}
