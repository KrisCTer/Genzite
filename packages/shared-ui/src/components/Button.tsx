import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react'
import { Loader2 } from 'lucide-react'
import { cn } from '../utils/cn'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  leftIcon?: ReactNode
  rightIcon?: ReactNode
}

const variantStyles: Record<string, string> = {
  primary: [
    'bg-[var(--gz-primary-600)] text-white',
    'hover:bg-[var(--gz-primary-700)]',
    'active:bg-[var(--gz-primary-800)]',
    'focus-visible:ring-2 focus-visible:ring-[var(--gz-primary-300)] focus-visible:ring-offset-2',
  ].join(' '),
  secondary: [
    'bg-[var(--gz-surface-raised)] text-[var(--gz-text)] border border-[var(--gz-border)]',
    'hover:bg-[var(--gz-surface-sunken)] hover:border-[var(--gz-border-strong)]',
    'active:bg-[var(--gz-border)]',
    'focus-visible:ring-2 focus-visible:ring-[var(--gz-primary-200)] focus-visible:ring-offset-2',
  ].join(' '),
  ghost: [
    'bg-transparent text-[var(--gz-text-secondary)]',
    'hover:bg-[var(--gz-surface-sunken)] hover:text-[var(--gz-text)]',
    'active:bg-[var(--gz-border)]',
    'focus-visible:ring-2 focus-visible:ring-[var(--gz-primary-200)] focus-visible:ring-offset-2',
  ].join(' '),
  danger: [
    'bg-[var(--gz-danger-500)] text-white',
    'hover:bg-[var(--gz-danger-600)]',
    'active:bg-[var(--gz-danger-600)]',
    'focus-visible:ring-2 focus-visible:ring-red-200 focus-visible:ring-offset-2',
  ].join(' '),
}

const sizeStyles: Record<string, string> = {
  sm: 'px-3 py-1.5 text-sm gap-1.5',
  md: 'px-4 py-2 text-sm gap-2',
  lg: 'px-5 py-2.5 text-base gap-2',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', loading, leftIcon, rightIcon, disabled, className, children, ...props }, ref) => (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center justify-center font-medium',
        'rounded-[var(--gz-radius-md)] transition-colors duration-[var(--gz-transition-base)]',
        'outline-none cursor-pointer',
        'disabled:opacity-50 disabled:pointer-events-none',
        variantStyles[variant],
        sizeStyles[size],
        className,
      )}
      {...props}
    >
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : leftIcon}
      {children}
      {!loading && rightIcon}
    </button>
  ),
)

Button.displayName = 'Button'
