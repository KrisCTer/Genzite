import { createContext, useCallback, useContext, useState, type ReactNode } from 'react'
import * as ToastPrimitive from '@radix-ui/react-toast'
import { X, CheckCircle2, AlertCircle, Info } from 'lucide-react'
import { cn } from '../utils/cn'

type ToastVariant = 'success' | 'error' | 'info'

interface ToastItem {
  id: string
  title: string
  description?: string
  variant: ToastVariant
}

interface ToastContextValue {
  toast: (item: Omit<ToastItem, 'id'>) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within a <Toaster>')
  return ctx
}

const variantConfig = {
  success: {
    icon: CheckCircle2,
    borderClass: 'border-l-[var(--gz-success-500)]',
    iconClass: 'text-[var(--gz-success-500)]',
  },
  error: {
    icon: AlertCircle,
    borderClass: 'border-l-[var(--gz-danger-500)]',
    iconClass: 'text-[var(--gz-danger-500)]',
  },
  info: {
    icon: Info,
    borderClass: 'border-l-[var(--gz-info-500)]',
    iconClass: 'text-[var(--gz-info-500)]',
  },
}

export function Toaster({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const toast = useCallback((item: Omit<ToastItem, 'id'>) => {
    const id = Date.now().toString()
    setToasts((prev) => [...prev, { ...item, id }])
  }, [])

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ toast }}>
      <ToastPrimitive.Provider swipeDirection="right" duration={4000}>
        {children}
        {toasts.map((t) => {
          const config = variantConfig[t.variant]
          const Icon = config.icon
          return (
            <ToastPrimitive.Root
              key={t.id}
              onOpenChange={(open) => { if (!open) removeToast(t.id) }}
              className={cn(
                'flex items-start gap-3',
                'bg-[var(--gz-surface-raised)] border border-[var(--gz-border)]',
                'border-l-4', config.borderClass,
                'rounded-[var(--gz-radius-lg)] shadow-[var(--gz-shadow-lg)]',
                'p-4 min-w-[320px]',
                'data-[state=open]:animate-in data-[state=closed]:animate-out',
                'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
                'data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-right-full',
              )}
            >
              <Icon className={cn('w-5 h-5 mt-0.5 shrink-0', config.iconClass)} />
              <div className="flex-1 min-w-0">
                <ToastPrimitive.Title className="text-sm font-medium text-[var(--gz-text)]">
                  {t.title}
                </ToastPrimitive.Title>
                {t.description && (
                  <ToastPrimitive.Description className="text-sm text-[var(--gz-text-secondary)] mt-0.5">
                    {t.description}
                  </ToastPrimitive.Description>
                )}
              </div>
              <ToastPrimitive.Close
                className={cn(
                  'p-1 rounded-[var(--gz-radius-sm)]',
                  'text-[var(--gz-text-muted)] hover:text-[var(--gz-text)]',
                  'hover:bg-[var(--gz-surface-sunken)]',
                  'transition-colors cursor-pointer',
                )}
              >
                <X className="w-4 h-4" />
              </ToastPrimitive.Close>
            </ToastPrimitive.Root>
          )
        })}
        <ToastPrimitive.Viewport
          className="fixed bottom-4 right-4 flex flex-col gap-2 w-auto max-w-[420px] z-50 outline-none"
        />
      </ToastPrimitive.Provider>
    </ToastContext.Provider>
  )
}
