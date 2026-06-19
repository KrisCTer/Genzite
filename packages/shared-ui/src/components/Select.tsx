import { forwardRef } from 'react'
import * as SelectPrimitive from '@radix-ui/react-select'
import { ChevronDown, Check } from 'lucide-react'
import { cn } from '../utils/cn'

export interface SelectOption {
  value: string
  label: string
  disabled?: boolean
}

export interface SelectProps {
  value?: string
  onValueChange?: (value: string) => void
  options: SelectOption[]
  placeholder?: string
  label?: string
  error?: string
  disabled?: boolean
  className?: string
}

export function Select({
  value,
  onValueChange,
  options,
  placeholder = 'Select...',
  label,
  error,
  disabled,
  className,
}: SelectProps) {
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      {label && (
        <label className="text-sm font-medium text-[var(--gz-text)]">{label}</label>
      )}
      <SelectPrimitive.Root value={value} onValueChange={onValueChange} disabled={disabled}>
        <SelectPrimitive.Trigger
          className={cn(
            'inline-flex items-center justify-between',
            'w-full bg-[var(--gz-surface-raised)] text-[var(--gz-text)]',
            'border border-[var(--gz-border)] rounded-[var(--gz-radius-md)]',
            'px-3 py-2 text-sm',
            'outline-none transition-colors duration-[var(--gz-transition-base)]',
            'focus:border-[var(--gz-border-focus)] focus:ring-2 focus:ring-[var(--gz-primary-100)]',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            'data-[placeholder]:text-[var(--gz-text-muted)]',
            error && 'border-[var(--gz-danger-500)]',
          )}
        >
          <SelectPrimitive.Value placeholder={placeholder} />
          <SelectPrimitive.Icon>
            <ChevronDown className="w-4 h-4 text-[var(--gz-text-muted)]" />
          </SelectPrimitive.Icon>
        </SelectPrimitive.Trigger>

        <SelectPrimitive.Portal>
          <SelectPrimitive.Content
            className={cn(
              'overflow-hidden bg-[var(--gz-surface-raised)]',
              'border border-[var(--gz-border)] rounded-[var(--gz-radius-lg)]',
              'shadow-[var(--gz-shadow-lg)]',
              'data-[state=open]:animate-in data-[state=closed]:animate-out',
              'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
              'data-[side=bottom]:slide-in-from-top-2 data-[side=top]:slide-in-from-bottom-2',
            )}
            position="popper"
            sideOffset={4}
          >
            <SelectPrimitive.Viewport className="p-1">
              {options.map((option) => (
                <SelectItem key={option.value} value={option.value} disabled={option.disabled}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectPrimitive.Viewport>
          </SelectPrimitive.Content>
        </SelectPrimitive.Portal>
      </SelectPrimitive.Root>
      {error && <p className="text-xs text-[var(--gz-danger-500)]">{error}</p>}
    </div>
  )
}

const SelectItem = forwardRef<HTMLDivElement, SelectPrimitive.SelectItemProps>(
  ({ children, className, ...props }, ref) => (
    <SelectPrimitive.Item
      ref={ref}
      className={cn(
        'relative flex items-center',
        'px-3 py-2 pr-8 text-sm text-[var(--gz-text)]',
        'rounded-[var(--gz-radius-sm)] cursor-pointer',
        'outline-none select-none',
        'data-[highlighted]:bg-[var(--gz-surface-sunken)]',
        'data-[disabled]:opacity-50 data-[disabled]:pointer-events-none',
        className,
      )}
      {...props}
    >
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
      <SelectPrimitive.ItemIndicator className="absolute right-2">
        <Check className="w-4 h-4 text-[var(--gz-primary-600)]" />
      </SelectPrimitive.ItemIndicator>
    </SelectPrimitive.Item>
  ),
)

SelectItem.displayName = 'SelectItem'
