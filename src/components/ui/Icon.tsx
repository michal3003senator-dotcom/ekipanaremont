import type { LucideIcon } from 'lucide-react'

import { cn } from '@/lib/cn'

type Props = {
  icon: LucideIcon
  /** Podpis dla czytników ekranu; bez niego ikona jest dekoracją. */
  label?: string
  className?: string
}

/** Ikona lucide z jednego zestawu, linia 1,75 (DESIGN §8), domyślnie 20 px. */
export function Icon({ icon: Glyph, label, className }: Props) {
  return (
    <Glyph
      strokeWidth={1.75}
      aria-hidden={label ? undefined : true}
      aria-label={label}
      role={label ? 'img' : undefined}
      className={cn('size-5 shrink-0', className)}
    />
  )
}
