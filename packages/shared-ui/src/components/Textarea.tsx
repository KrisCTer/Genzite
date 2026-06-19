import { forwardRef, useEffect, useRef, type TextareaHTMLAttributes } from 'react'
import { cn } from '../utils/cn'

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  hint?: string
  autoResize?: boolean
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, hint, autoResize, className, id, rows = 3, ...props }, ref) => {
    const textareaId = id || label?.toLowerCase().replace(/\s+/g, '-')
    const internalRef = useRef<HTMLTextAreaElement | null>(null)

    useEffect(() => {
      if (!autoResize || !internalRef.current) return
      const el = internalRef.current
      const handleInput = () => {
        el.style.height = 'auto'
        el.style.height = `${el.scrollHeight}px`
      }
      el.addEventListener('input', handleInput)
      return () => el.removeEventListener('input', handleInput)
    }, [autoResize])

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={textareaId} className="text-sm font-medium text-[var(--gz-text)]">
            {label}
          </label>
        )}
        <textarea
          ref={(el) => {
            internalRef.current = el
            if (typeof ref === 'function') ref(el)
            else if (ref) ref.current = el
          }}
          id={textareaId}
          rows={rows}
          className={cn(
            'w-full bg-[var(--gz-surface-raised)] text-[var(--gz-text)]',
            'border border-[var(--gz-border)] rounded-[var(--gz-radius-md)]',
            'px-3 py-2 text-sm resize-y',
            'placeholder:text-[var(--gz-text-muted)]',
            'outline-none transition-colors duration-[var(--gz-transition-base)]',
            'focus:border-[var(--gz-border-focus)] focus:ring-2 focus:ring-[var(--gz-primary-100)]',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            error && 'border-[var(--gz-danger-500)] focus:border-[var(--gz-danger-500)] focus:ring-[var(--gz-danger-50)]',
            autoResize && 'resize-none overflow-hidden',
            className,
          )}
          aria-invalid={!!error}
          {...props}
        />
        {error && <p className="text-xs text-[var(--gz-danger-500)]">{error}</p>}
        {!error && hint && <p className="text-xs text-[var(--gz-text-muted)]">{hint}</p>}
      </div>
    )
  },
)

Textarea.displayName = 'Textarea'
