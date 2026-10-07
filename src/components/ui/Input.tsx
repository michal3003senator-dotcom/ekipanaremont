import type { ComponentProps } from 'react'

import { cn } from '@/lib/cn'

/** Wspólny wygląd pól tekstowych: 48 px, obramowanie z kontrastem 3:1, błąd w kolorze danger. */
export const fieldClasses =
  'w-full rounded-control border border-line-strong bg-surface-2 text-body text-text transition-colors duration-150 placeholder:text-text-muted hover:border-text-muted disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-danger'

export function Input({ className, type = 'text', ...props }: ComponentProps<'input'>) {
  return <input type={type} className={cn(fieldClasses, 'h-12 px-4', className)} {...props} />
}
