import type { HTMLAttributes, ReactNode } from 'react'
import { cn } from '../utils/cn'

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hoverable?: boolean
}

export interface CardSectionProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
}

export function Card({ hoverable, className, children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'bg-[var(--gz-surface-raised)] border border-[var(--gz-border)]',
        'rounded-[var(--gz-radius-lg)] shadow-[var(--gz-shadow-xs)]',
        'transition-shadow duration-[var(--gz-transition-base)]',
        hoverable && 'hover:shadow-[var(--gz-shadow-md)] hover:border-[var(--gz-border-strong)]',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  )
}

function CardHeader({ className, children, ...props }: CardSectionProps) {
  return (
    <div
      className={cn('px-5 pt-5 pb-0', className)}
      {...props}
    >
      {children}
    </div>
  )
}

function CardBody({ className, children, ...props }: CardSectionProps) {
  return (
    <div className={cn('px-5 py-4', className)} {...props}>
      {children}
    </div>
  )
}

function CardFooter({ className, children, ...props }: CardSectionProps) {
  return (
    <div
      className={cn(
        'px-5 py-3 border-t border-[var(--gz-border)]',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  )
}

Card.Header = CardHeader
Card.Body = CardBody
Card.Footer = CardFooter
