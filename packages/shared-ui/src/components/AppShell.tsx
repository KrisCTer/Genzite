import type { ReactNode } from 'react'
import { cn } from '../utils/cn'

export interface AppShellProps {
  sidebar?: ReactNode
  header?: ReactNode
  children: ReactNode
  className?: string
}

export function AppShell({ sidebar, header, children, className }: AppShellProps) {
  return (
    <div className={cn('min-h-screen bg-[var(--gz-surface)] flex', className)}>
      {sidebar && (
        <aside className="w-60 shrink-0 border-r border-[var(--gz-border)] bg-[var(--gz-surface-raised)]">
          {sidebar}
        </aside>
      )}
      <div className="flex-1 flex flex-col min-w-0">
        {header && (
          <header className="h-14 shrink-0 border-b border-[var(--gz-border)] bg-[var(--gz-surface-raised)] flex items-center px-6">
            {header}
          </header>
        )}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
