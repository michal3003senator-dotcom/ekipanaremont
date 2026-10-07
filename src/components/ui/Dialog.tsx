'use client'

import { X } from 'lucide-react'
import { Dialog as DialogPrimitive } from 'radix-ui'
import type { ComponentProps, ReactNode } from 'react'

import { cn } from '@/lib/cn'

import { Button } from './Button'
import { Icon } from './Icon'

export const Dialog = DialogPrimitive.Root
export const DialogTrigger = DialogPrimitive.Trigger
export const DialogClose = DialogPrimitive.Close

/** Tło pod nakładką: przyciemnienie, bez rozmycia (DESIGN §2: szkło tylko w nagłówku). */
export function Overlay({ className, ...props }: ComponentProps<typeof DialogPrimitive.Overlay>) {
  return (
    <DialogPrimitive.Overlay
      className={cn(
        'fixed inset-0 z-40 bg-scrim state-open:animate-fade-in state-closed:animate-fade-out',
        className,
      )}
      {...props}
    />
  )
}

type ContentProps = ComponentProps<typeof DialogPrimitive.Content> & {
  title: string
  description?: ReactNode
  /** Przyciski na dole okna; główna akcja ostatnia. */
  footer?: ReactNode
}

export function DialogContent({
  title,
  description,
  footer,
  className,
  children,
  ...props
}: ContentProps) {
  return (
    <DialogPrimitive.Portal>
      <Overlay />
      <DialogPrimitive.Content
        className={cn(
          'dialog-panel fixed start-1/2 top-1/2 z-40 flex -translate-x-1/2 -translate-y-1/2 flex-col gap-4 overflow-y-auto rounded-card border border-line bg-surface-1 p-6 shadow-float inset-shadow-edge state-open:animate-pop-in state-closed:animate-pop-out',
          className,
        )}
        {...props}
      >
        <div className="flex items-start justify-between gap-4">
          <DialogPrimitive.Title className="font-display text-h3 font-medium">
            {title}
          </DialogPrimitive.Title>
          <DialogPrimitive.Close asChild>
            <Button variant="ghost" size="icon-sm" aria-label="Zamknij" className="-me-2 -mt-2">
              <Icon icon={X} />
            </Button>
          </DialogPrimitive.Close>
        </div>
        {description ? (
          <DialogPrimitive.Description className="text-body text-text-muted">
            {description}
          </DialogPrimitive.Description>
        ) : (
          <DialogPrimitive.Description className="sr-only">{title}</DialogPrimitive.Description>
        )}
        {children}
        {footer && (
          <div className="mt-2 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            {footer}
          </div>
        )}
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  )
}
