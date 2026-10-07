'use client'

import { Check } from 'lucide-react'
import { Checkbox as CheckboxPrimitive } from 'radix-ui'
import type { ComponentProps, ReactNode } from 'react'

import { cn } from '@/lib/cn'

import { Icon } from './Icon'

/** Zaznaczenie w kolorze tekstu – akcent zostaje dla głównej akcji i terminu (DESIGN §3). */
export function Checkbox({ className, ...props }: ComponentProps<typeof CheckboxPrimitive.Root>) {
  return (
    <CheckboxPrimitive.Root
      className={cn(
        'peer flex size-6 shrink-0 cursor-pointer items-center justify-center rounded-tile-lg border border-line-strong bg-surface-2 text-bg transition-colors duration-150 hover:border-text-muted disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-danger state-checked:border-text state-checked:bg-text',
        className,
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator>
        <Icon icon={Check} className="size-4" />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  )
}

type FieldProps = ComponentProps<typeof CheckboxPrimitive.Root> & {
  id: string
  label: ReactNode
  description?: ReactNode
}

/** Pole wyboru z etykietą; cały wiersz ma co najmniej 44 px wysokości (cel dotyku). */
export function CheckboxField({ id, label, description, className, ...props }: FieldProps) {
  return (
    <div className={cn('flex min-h-11 items-start gap-3 py-2.5', className)}>
      <Checkbox id={id} aria-describedby={description ? `${id}-opis` : undefined} {...props} />
      <div className="flex flex-col gap-0.5">
        <label htmlFor={id} className="cursor-pointer text-body leading-6">
          {label}
        </label>
        {description && (
          <p id={`${id}-opis`} className="text-small text-text-muted">
            {description}
          </p>
        )}
      </div>
    </div>
  )
}
