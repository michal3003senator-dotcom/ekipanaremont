'use client'

import { Check, CircleAlert, X } from 'lucide-react'
import { Toast as ToastPrimitive } from 'radix-ui'
import { useSyncExternalStore } from 'react'

import { cn } from '@/lib/cn'

import { Icon } from './Icon'

type ToastTone = 'success' | 'danger' | 'neutral'
type ToastItem = { id: number; title: string; description?: string; tone: ToastTone }

// Prosty magazyn powiadomień: toast() można wywołać z dowolnego komponentu klienckiego.
let items: ToastItem[] = []
let nextId = 1
const listeners = new Set<() => void>()

function emit() {
  for (const listener of listeners) listener()
}

/**
 * Pokazuje powiadomienie. Ten sam czasownik co w przycisku (DESIGN §8):
 * „Potwierdzam termin” → toast({ title: 'Termin potwierdzony' }).
 */
export function toast(input: { title: string; description?: string; tone?: ToastTone }) {
  items = [...items, { id: nextId++, tone: 'success', ...input }]
  emit()
}

function dismiss(id: number) {
  items = items.filter((item) => item.id !== id)
  emit()
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

const getItems = () => items
const getServerItems = (): ToastItem[] => []

const TONE_ICON = { success: Check, danger: CircleAlert, neutral: null } as const

/** Miejsce na powiadomienia – raz, w głównym layoucie. */
export function Toaster() {
  const current = useSyncExternalStore(subscribe, getItems, getServerItems)

  return (
    <ToastPrimitive.Provider label="Powiadomienie" duration={5000} swipeDirection="down">
      {current.map((item) => {
        const toneIcon = TONE_ICON[item.tone]
        return (
          <ToastPrimitive.Root
            key={item.id}
            onOpenChange={(open) => {
              if (!open) dismiss(item.id)
            }}
            className="flex w-full items-start gap-3 rounded-card border border-line bg-surface-1 p-4 shadow-float state-open:animate-toast-in state-closed:animate-fade-out"
          >
            {toneIcon && (
              <Icon
                icon={toneIcon}
                className={cn('mt-0.5', item.tone === 'success' ? 'text-success' : 'text-danger')}
              />
            )}
            <div className="flex flex-1 flex-col gap-1">
              <ToastPrimitive.Title className="font-medium">{item.title}</ToastPrimitive.Title>
              {item.description && (
                <ToastPrimitive.Description className="text-small text-text-muted">
                  {item.description}
                </ToastPrimitive.Description>
              )}
            </div>
            <ToastPrimitive.Close
              aria-label="Zamknij powiadomienie"
              className="-m-2 flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-control text-text-muted hover:bg-surface-2 hover:text-text"
            >
              <Icon icon={X} className="size-4" />
            </ToastPrimitive.Close>
          </ToastPrimitive.Root>
        )
      })}
      <ToastPrimitive.Viewport className="toast-viewport fixed inset-x-0 bottom-0 z-50 mx-auto flex w-full max-w-md flex-col gap-2 px-4 outline-none" />
    </ToastPrimitive.Provider>
  )
}
