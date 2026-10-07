import type { ComponentProps } from 'react'

import { cn } from '@/lib/cn'

/** Szkielet w kształcie docelowej treści (DESIGN §8); bez pulsowania przy ograniczonym ruchu. */
export function Skeleton({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      aria-hidden="true"
      className={cn('rounded-badge bg-surface-2 motion-safe:animate-pulse', className)}
      {...props}
    />
  )
}
