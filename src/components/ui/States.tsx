import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'

import { cn } from '@/lib/cn'

import { Icon } from './Icon'

type StateProps = {
  icon: LucideIcon
  title: string
  /** Co dalej zrobić – konkretnie, bez przeprosin (DESIGN §8). */
  description: string
  /** Jedna konkretna akcja. */
  action?: ReactNode
  tone?: 'neutral' | 'danger'
  className?: string
}

function State({ icon, title, description, action, tone = 'neutral', className }: StateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-start gap-3 rounded-card border border-line bg-surface-1 p-6 inset-shadow-edge md:p-8',
        className,
      )}
    >
      <span
        className={cn(
          'flex size-11 items-center justify-center rounded-control bg-surface-2',
          tone === 'danger' ? 'text-danger' : 'text-text-muted',
        )}
      >
        <Icon icon={icon} />
      </span>
      <h3 className="text-lead font-semibold">{title}</h3>
      <p className="max-w-prose text-small text-text-muted">{description}</p>
      {action && <div className="mt-2">{action}</div>}
    </div>
  )
}

/** Pusty stan z jedną konkretną akcją (DESIGN §8). */
export function EmptyState(props: Omit<StateProps, 'tone'>) {
  return <State {...props} />
}

/** Błąd: co się stało i jak to naprawić, bez ogólników. */
export function ErrorState(props: Omit<StateProps, 'tone'>) {
  return (
    <div role="alert">
      <State {...props} tone="danger" />
    </div>
  )
}
