import { cva, type VariantProps } from 'class-variance-authority'
import type { ComponentProps } from 'react'

import { cn } from '@/lib/cn'

const badgeVariants = cva(
  'inline-flex h-6 items-center gap-1 whitespace-nowrap rounded-badge border px-2 text-micro font-medium',
  {
    variants: {
      tone: {
        neutral: 'border-line bg-surface-2 text-text',
        success: 'border-line bg-surface-2 text-success',
        danger: 'border-line bg-surface-2 text-danger',
        outline: 'border-line-strong text-text-muted',
      },
    },
    defaultVariants: { tone: 'neutral' },
  },
)

type Props = ComponentProps<'span'> & VariantProps<typeof badgeVariants>

/** Znacznik statusu lub cechy, np. „W rejestrze CEIDG”, „Faktura VAT”. */
export function Badge({ tone, className, ...props }: Props) {
  return <span className={cn(badgeVariants({ tone }), className)} {...props} />
}
