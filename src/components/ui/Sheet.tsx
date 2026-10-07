'use client'

import { X } from 'lucide-react'
import { Dialog as DialogPrimitive } from 'radix-ui'
import { type PointerEvent, type ReactNode, useRef, useState } from 'react'

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

/**
 * Przeciąganie panelu w dół palcem (bez biblioteki animacji – lżejsza strona). Gest działa na
 * uchwycie i nagłówku, więc przewijanie treści panelu mu nie przeszkadza.
 */
function useSwipeDown(onDismiss: () => void) {
  const start = useRef<{ y: number; time: number } | null>(null)
  const [offset, setOffset] = useState(0)

  const end = (event: PointerEvent) => {
    const from = start.current
    start.current = null
    setOffset(0)
    if (!from) return
    const distance = event.clientY - from.y
    const velocity = (distance / Math.max(1, event.timeStamp - from.time)) * 1000
    if (distance > CLOSE_OFFSET || velocity > CLOSE_VELOCITY) onDismiss()
  }

  const handlers = {
    onPointerDown: (event: PointerEvent) => {
      // Przycisk „Zamknij” w nagłówku działa zwykłym dotknięciem, bez przechwytywania gestu.
      if (event.pointerType === 'mouse' || (event.target as Element).closest('button')) return
      start.current = { y: event.clientY, time: event.timeStamp }
      event.currentTarget.setPointerCapture(event.pointerId)
    },
    onPointerMove: (event: PointerEvent) => {
      if (start.current) setOffset(Math.max(0, event.clientY - start.current.y))
    },
    onPointerUp: end,
    onPointerCancel: end,
  }
  return { offset, handlers }
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
  const { offset, handlers } = useSwipeDown(onDismiss)

  return (
    <DialogPrimitive.Portal>
      <Overlay />
      <DialogPrimitive.Content asChild>
        <div
          style={offset ? { transform: `translateY(${offset}px)` } : undefined}
          className={cn(
            !offset && 'transition-transform duration-200 ease-standard',
            'sheet-panel fixed inset-x-0 bottom-0 z-40 mx-auto flex w-full max-w-xl flex-col gap-4 overflow-y-auto rounded-t-card border border-b-0 border-line bg-surface-1 px-4 pt-3 shadow-float inset-shadow-edge state-open:animate-sheet-in state-closed:animate-sheet-out md:px-6',
            className,
          )}
        >
          <div {...handlers} className="-mx-4 -mt-3 touch-none px-4 pt-3 md:-mx-6 md:px-6">
            <div
              className="mx-auto h-1 w-10 shrink-0 rounded-full bg-line-strong"
              aria-hidden="true"
            />
          </div>
          <div {...handlers} className="flex touch-none items-start justify-between gap-4">
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
        </div>
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  )
}
