import type { ReactNode } from 'react'
import * as DropdownPrimitive from '@radix-ui/react-dropdown-menu'
import { cn } from '../utils/cn'

export interface DropdownMenuProps {
  trigger: ReactNode
  children: ReactNode
  align?: 'start' | 'center' | 'end'
}

export function DropdownMenu({ trigger, children, align = 'end' }: DropdownMenuProps) {
  return (
    <DropdownPrimitive.Root>
      <DropdownPrimitive.Trigger asChild>
        {trigger}
      </DropdownPrimitive.Trigger>
      <DropdownPrimitive.Portal>
        <DropdownPrimitive.Content
          align={align}
          sideOffset={6}
          className={cn(
            'min-w-[180px] overflow-hidden',
            'bg-[var(--gz-surface-raised)] border border-[var(--gz-border)]',
            'rounded-[var(--gz-radius-lg)] shadow-[var(--gz-shadow-lg)]',
            'p-1',
            'animate-in fade-in-0 zoom-in-95',
            'data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95',
            'data-[side=bottom]:slide-in-from-top-2',
            'data-[side=top]:slide-in-from-bottom-2',
          )}
        >
          {children}
        </DropdownPrimitive.Content>
      </DropdownPrimitive.Portal>
    </DropdownPrimitive.Root>
  )
}

export interface DropdownItemProps {
  children: ReactNode
  onSelect?: () => void
  destructive?: boolean
  disabled?: boolean
  className?: string
}

export function DropdownItem({
  children,
  onSelect,
  destructive,
  disabled,
  className,
}: DropdownItemProps) {
  return (
    <DropdownPrimitive.Item
      onSelect={onSelect}
      disabled={disabled}
      className={cn(
        'flex items-center gap-2',
        'px-3 py-2 text-sm rounded-[var(--gz-radius-sm)]',
        'outline-none cursor-pointer select-none',
        'transition-colors duration-[var(--gz-transition-fast)]',
        destructive
          ? 'text-[var(--gz-danger-500)] data-[highlighted]:bg-[var(--gz-danger-50)]'
          : 'text-[var(--gz-text)] data-[highlighted]:bg-[var(--gz-surface-sunken)]',
        'data-[disabled]:opacity-50 data-[disabled]:pointer-events-none',
        className,
      )}
    >
      {children}
    </DropdownPrimitive.Item>
  )
}

export function DropdownSeparator() {
  return (
    <DropdownPrimitive.Separator className="h-px my-1 bg-[var(--gz-border)]" />
  )
}

export function DropdownLabel({ children }: { children: ReactNode }) {
  return (
    <DropdownPrimitive.Label className="px-3 py-1.5 text-xs font-medium text-[var(--gz-text-muted)]">
      {children}
    </DropdownPrimitive.Label>
  )
}
