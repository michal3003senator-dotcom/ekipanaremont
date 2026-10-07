'use client'

import { X } from 'lucide-react'
import { motion, useReducedMotion } from 'motion/react'
import { Dialog as DialogPrimitive } from 'radix-ui'
import type { ReactNode } from 'react'

import { cn } from '@/lib/cn'

import { Button } from './Button'
import { Overlay } from './Dialog'
import { Icon } from './Icon'

export const Sheet = DialogPrimitive.Root
export const SheetTrigger = DialogPrimitive.Trigger
export const SheetClose = DialogPrimitive.Close

/** Przesunięcie (px) lub prędkość (px/s), po której panel się zamyka. */
const CLOSE_OFFSET = 96
const CLOSE_VELOCITY = 600

type Props = {
  title: string
  description?: ReactNode
  /** Zamknięcie z gestu przesunięcia w dół. */
  onDismiss: () => void
  footer?: ReactNode
  className?: string
  children: ReactNode
}

/** Dolny panel na telefonie: obsługa jedną ręką, przesunięcie w dół zamyka. */
export function SheetContent({
  title,
  description,
  onDismiss,
  footer,
  className,
  children,
}: Props) {
  const reduceMotion = useReducedMotion()

  return (
    <DialogPrimitive.Portal>
      <Overlay />
      <DialogPrimitive.Content asChild>
        <motion.div
          drag={reduceMotion ? false : 'y'}
          dragConstraints={{ top: 0, bottom: 0 }}
          dragElastic={{ top: 0, bottom: 0.6 }}
          dragSnapToOrigin
          onDragEnd={(_, info) => {
            if (info.offset.y > CLOSE_OFFSET || info.velocity.y > CLOSE_VELOCITY) onDismiss()
          }}
          className={cn(
            'sheet-panel fixed inset-x-0 bottom-0 z-40 mx-auto flex w-full max-w-xl flex-col gap-4 overflow-y-auto rounded-t-card border border-b-0 border-line bg-surface-1 px-4 pt-3 shadow-float inset-shadow-edge state-open:animate-sheet-in state-closed:animate-sheet-out md:px-6',
            className,
          )}
        >
          <div
            className="mx-auto h-1 w-10 shrink-0 rounded-full bg-line-strong"
            aria-hidden="true"
          />
          <div className="flex items-start justify-between gap-4">
            <DialogPrimitive.Title className="font-display text-h3 font-medium">
              {title}
            </DialogPrimitive.Title>
            <DialogPrimitive.Close asChild>
              <Button variant="ghost" size="icon-sm" aria-label="Zamknij" className="-me-2 -mt-1">
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
          {footer && <div className="flex flex-col gap-3">{footer}</div>}
        </motion.div>
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  )
}
