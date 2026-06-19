import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react'
import { cn } from '../utils/cn'

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
  leftIcon?: ReactNode
  rightIcon?: ReactNode
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, leftIcon, rightIcon, className, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-')

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-[var(--gz-text)]"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--gz-text-muted)] pointer-events-none">
              {leftIcon}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              'w-full bg-[var(--gz-surface-raised)] text-[var(--gz-text)]',
              'border border-[var(--gz-border)] rounded-[var(--gz-radius-md)]',
              'px-3 py-2 text-sm',
              'placeholder:text-[var(--gz-text-muted)]',
              'outline-none transition-colors duration-[var(--gz-transition-base)]',
              'focus:border-[var(--gz-border-focus)] focus:ring-2 focus:ring-[var(--gz-primary-100)]',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              error && 'border-[var(--gz-danger-500)] focus:border-[var(--gz-danger-500)] focus:ring-[var(--gz-danger-50)]',
              !!leftIcon && 'pl-10',
              !!rightIcon && 'pr-10',
              className,
            )}
            aria-invalid={!!error}
            aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
            {...props}
          />
          {rightIcon && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--gz-text-muted)]">
              {rightIcon}
            </span>
          )}
        </div>
        {error && (
          <p id={`${inputId}-error`} className="text-xs text-[var(--gz-danger-500)]">{error}</p>
        )}
        {!error && hint && (
          <p id={`${inputId}-hint`} className="text-xs text-[var(--gz-text-muted)]">{hint}</p>
        )}
      </div>
    )
  },
)

Input.displayName = 'Input'
