import type { ReactNode } from 'react'

import { cn } from '@/lib/cn'

/** Sekcja panelu: nagłówek z opcjonalną akcją, treść oddzielona fugą (DESIGN §2). */
export function PanelSection({
  title,
  action,
  children,
  className,
}: {
  title: string
  action?: ReactNode
  children: ReactNode
  className?: string
}) {
  return (
    <section className={cn('flex flex-col gap-4 border-t border-line pt-6', className)}>
      <div className="flex items-baseline justify-between gap-4">
        <h2 className="text-lead font-medium">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  )
}

/** Nagłówek strony panelu – h1 i jedno zdanie, co tu zrobić. */
export function PanelHeading({
  title,
  lead,
  children,
}: {
  title: string
  lead?: ReactNode
  children?: ReactNode
}) {
  return (
    <div className="mb-8 flex flex-col gap-2">
      <h1 className="font-display text-h2 font-medium text-balance">{title}</h1>
      {lead && <p className="text-body text-text-muted text-pretty">{lead}</p>}
      {children}
    </div>
  )
}
