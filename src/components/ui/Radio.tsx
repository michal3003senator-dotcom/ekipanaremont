'use client'

import { RadioGroup as RadioPrimitive } from 'radix-ui'
import type { ComponentProps, ReactNode } from 'react'

import { cn } from '@/lib/cn'

export function RadioGroup({ className, ...props }: ComponentProps<typeof RadioPrimitive.Root>) {
  return <RadioPrimitive.Root className={cn('flex flex-col', className)} {...props} />
}

type ItemProps = ComponentProps<typeof RadioPrimitive.Item> & {
  id: string
  label: ReactNode
  description?: ReactNode
}

export function RadioItem({ id, label, description, className, ...props }: ItemProps) {
  return (
    <div className={cn('flex min-h-11 items-start gap-3 py-2.5', className)}>
      <RadioPrimitive.Item
        id={id}
        aria-describedby={description ? `${id}-opis` : undefined}
        className="flex size-6 shrink-0 cursor-pointer items-center justify-center rounded-full border border-line-strong bg-surface-2 transition-colors duration-150 hover:border-text-muted disabled:cursor-not-allowed disabled:opacity-50 state-checked:border-text"
        {...props}
      >
        <RadioPrimitive.Indicator className="size-3 rounded-full bg-text" />
      </RadioPrimitive.Item>
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
