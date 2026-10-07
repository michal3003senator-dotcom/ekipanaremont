import type { ReactNode } from 'react'

import { cn } from '@/lib/cn'

/** Sekcja styleguide: nazwa komponentu, opis zasad i komórki ze stanami. */
export function Section({
  title,
  description,
  children,
  className,
}: {
  title: string
  description?: string
  children: ReactNode
  className?: string
}) {
  return (
    <section className="border-t border-line py-10 md:py-14">
      <h2 className="font-display text-h2 font-semibold">{title}</h2>
      {description && <p className="mt-2 max-w-prose text-small text-text-muted">{description}</p>}
      <div className={cn('mt-6 grid gap-6', className)}>{children}</div>
    </section>
  )
}

/** Jeden stan komponentu z podpisem. */
export function State({
  label,
  children,
  className,
}: {
  label: string
  children: ReactNode
  className?: string
}) {
  return (
    <div className={cn('flex flex-col gap-3', className)}>
      <p className="text-micro font-medium uppercase tracking-caps text-text-muted">{label}</p>
      {children}
    </div>
  )
}
