import { forwardRef, useEffect, useRef, useState, type InputHTMLAttributes } from 'react'
import { Search, X } from 'lucide-react'
import { cn } from '../utils/cn'

export interface SearchInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  value?: string
  onChange?: (value: string) => void
  debounceMs?: number
}

export const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(
  ({ value: controlledValue, onChange, debounceMs = 300, className, placeholder = 'Search...', ...props }, ref) => {
    const [internalValue, setInternalValue] = useState(controlledValue ?? '')
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

    useEffect(() => {
      if (controlledValue !== undefined) setInternalValue(controlledValue)
    }, [controlledValue])

    const handleChange = (newValue: string) => {
      setInternalValue(newValue)
      if (timerRef.current) clearTimeout(timerRef.current)
      timerRef.current = setTimeout(() => onChange?.(newValue), debounceMs)
    }

    const handleClear = () => {
      setInternalValue('')
      onChange?.('')
    }

    return (
      <div className={cn('relative', className)}>
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--gz-text-muted)] pointer-events-none" />
        <input
          ref={ref}
          type="text"
          value={internalValue}
          onChange={(e) => handleChange(e.target.value)}
          placeholder={placeholder}
          className={cn(
            'w-full bg-[var(--gz-surface-raised)] text-[var(--gz-text)]',
            'border border-[var(--gz-border)] rounded-[var(--gz-radius-md)]',
            'pl-9 pr-9 py-2 text-sm',
            'placeholder:text-[var(--gz-text-muted)]',
            'outline-none transition-colors duration-[var(--gz-transition-base)]',
            'focus:border-[var(--gz-border-focus)] focus:ring-2 focus:ring-[var(--gz-primary-100)]',
          )}
          {...props}
        />
        {internalValue && (
          <button
            type="button"
            onClick={handleClear}
            className={cn(
              'absolute right-2 top-1/2 -translate-y-1/2 p-1',
              'text-[var(--gz-text-muted)] hover:text-[var(--gz-text)]',
              'rounded-[var(--gz-radius-sm)] hover:bg-[var(--gz-surface-sunken)]',
              'transition-colors cursor-pointer',
            )}
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    )
  },
)

SearchInput.displayName = 'SearchInput'
