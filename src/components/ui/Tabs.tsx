'use client'

import { Tabs as TabsPrimitive } from 'radix-ui'
import type { ComponentProps } from 'react'

import { cn } from '@/lib/cn'

export const Tabs = TabsPrimitive.Root

export function TabsList({ className, ...props }: ComponentProps<typeof TabsPrimitive.List>) {
  return (
    <TabsPrimitive.List
      className={cn('flex gap-6 overflow-x-auto border-b border-line', className)}
      {...props}
    />
  )
}

/** Zakładka: aktywna ma kreskę w kolorze tekstu – akcent zostaje dla głównej akcji. */
export function TabsTrigger({ className, ...props }: ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      className={cn(
        '-mb-px flex h-11 shrink-0 cursor-pointer items-center gap-2 border-b-2 border-transparent text-small font-medium text-text-muted transition-colors duration-150 hover:text-text state-active:border-text state-active:text-text',
        className,
      )}
      {...props}
    />
  )
}

export function TabsContent({ className, ...props }: ComponentProps<typeof TabsPrimitive.Content>) {
  return <TabsPrimitive.Content className={cn('pt-6', className)} {...props} />
}
