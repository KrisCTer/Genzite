import type { ReactNode } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import { cn } from '../utils/cn'

export interface ModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  children: ReactNode
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

const sizeStyles = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
}

export function Modal({
  open,
  onOpenChange,
  title,
  description,
  children,
  className,
  size = 'md',
}: ModalProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay
          className={cn(
            'fixed inset-0 bg-[var(--gz-surface-overlay)]',
            'data-[state=open]:animate-in data-[state=closed]:animate-out',
            'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
          )}
        />
        <Dialog.Content
          className={cn(
            'fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2',
            'bg-[var(--gz-surface-raised)] rounded-[var(--gz-radius-xl)]',
            'p-6 shadow-[var(--gz-shadow-lg)]',
            'w-[calc(100%-2rem)]',
            'data-[state=open]:animate-in data-[state=closed]:animate-out',
            'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
            'data-[state=closed]:zoom-out-97 data-[state=open]:zoom-in-97',
            'focus:outline-none',
            sizeStyles[size],
            className,
          )}
        >
          <Dialog.Title className="text-base font-semibold text-[var(--gz-text)]">
            {title}
          </Dialog.Title>
          {description && (
            <Dialog.Description className="text-sm text-[var(--gz-text-secondary)] mt-1">
              {description}
            </Dialog.Description>
          )}
          <div className="mt-4">{children}</div>
          <Dialog.Close
            className={cn(
              'absolute top-4 right-4 p-1.5 rounded-[var(--gz-radius-sm)]',
              'text-[var(--gz-text-muted)] hover:text-[var(--gz-text)]',
              'hover:bg-[var(--gz-surface-sunken)]',
              'transition-colors duration-[var(--gz-transition-fast)]',
              'outline-none focus-visible:ring-2 focus-visible:ring-[var(--gz-primary-200)]',
              'cursor-pointer',
            )}
          >
            <X className="w-4 h-4" />
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
