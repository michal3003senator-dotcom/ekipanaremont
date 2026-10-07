'use client'

import { Switch as SwitchPrimitive } from 'radix-ui'
import type { ComponentProps, ReactNode } from 'react'

import { cn } from '@/lib/cn'

type Props = ComponentProps<typeof SwitchPrimitive.Root> & {
  id: string
  label: ReactNode
  description?: ReactNode
}

/** Przełącznik ustawienia działającego od razu (np. powiadomienia e-mail). */
export function Switch({ id, label, description, className, ...props }: Props) {
  return (
    <div className={cn('flex min-h-11 items-start justify-between gap-4 py-2.5', className)}>
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
      <SwitchPrimitive.Root
        id={id}
        aria-describedby={description ? `${id}-opis` : undefined}
        className="relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full border border-line-strong bg-surface-2 p-0.5 transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-50 state-checked:border-text state-checked:bg-text"
        {...props}
      >
        <SwitchPrimitive.Thumb className="block size-5 rounded-full bg-text-muted transition duration-150 ease-standard state-checked:translate-x-5 state-checked:bg-bg" />
      </SwitchPrimitive.Root>
    </div>
  )
}
