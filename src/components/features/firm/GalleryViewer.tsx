'use client'

import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import { motion, useReducedMotion } from 'motion/react'
import Image from 'next/image'
import { Dialog as DialogPrimitive } from 'radix-ui'
import type { KeyboardEvent } from 'react'

import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'

import { projectCaption as caption } from './caption'
import type { Project } from './types'

/** Przesunięcie (px) lub prędkość (px/s), po której przechodzimy do sąsiedniego zdjęcia. */
const SWIPE_OFFSET = 80
const SWIPE_VELOCITY = 500

type Props = {
  projects: readonly Project[]
  index: number
  onIndexChange: (index: number) => void
  /** Fokus po zamknięciu wraca na miniaturę ostatnio oglądanego zdjęcia. */
  onCloseFocus: () => void
}

/** Powiększenie zdjęć realizacji: przesuwanie palcem, strzałki i Esc. Ładowane dopiero po otwarciu. */
export function GalleryViewer({ projects, index, onIndexChange, onCloseFocus }: Props) {
  const reduceMotion = useReducedMotion()
  const total = projects.length
  const current = projects[index]
  const go = (step: number) => onIndexChange((index + step + total) % total)

  function onKeyDown(event: KeyboardEvent) {
    if (event.key === 'ArrowRight') go(1)
    if (event.key === 'ArrowLeft') go(-1)
  }

  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="fixed inset-0 z-40 bg-bg state-open:animate-fade-in state-closed:animate-fade-out" />
      <DialogPrimitive.Content
        onKeyDown={onKeyDown}
        // Fokus wraca na miniaturę ostatnio oglądanego zdjęcia, nie na pierwszą z siatki.
        onCloseAutoFocus={(event) => {
          event.preventDefault()
          onCloseFocus()
        }}
        className="fixed inset-0 z-40 flex flex-col state-open:animate-fade-in state-closed:animate-fade-out"
      >
        <div className="flex items-center justify-between gap-4 px-4 py-3 md:px-6">
          <p className="font-data text-small text-text-muted" aria-live="polite">
            {index + 1} z {total}
          </p>
          <DialogPrimitive.Close asChild>
            <Button variant="ghost" size="icon" aria-label="Zamknij galerię">
              <Icon icon={X} />
            </Button>
          </DialogPrimitive.Close>
        </div>
        {current && (
          <>
            <DialogPrimitive.Title className="sr-only">
              Realizacje – zdjęcie {index + 1} z {total}
            </DialogPrimitive.Title>
            <motion.div
              key={current.id}
              drag={reduceMotion ? false : 'x'}
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.4}
              dragSnapToOrigin
              onDragEnd={(_, info) => {
                if (info.offset.x < -SWIPE_OFFSET || info.velocity.x < -SWIPE_VELOCITY) go(1)
                else if (info.offset.x > SWIPE_OFFSET || info.velocity.x > SWIPE_VELOCITY) go(-1)
              }}
              className="relative min-h-0 flex-1 touch-pan-y"
            >
              <Image
                src={current.photo.src}
                alt={current.photo.alt}
                fill
                sizes="100vw"
                className="pointer-events-none object-contain"
              />
            </motion.div>
            <DialogPrimitive.Description className="px-4 py-4 text-center text-small text-text-muted md:px-6">
              {caption(current)}
              {current.photo.demo && ' · zdjęcie poglądowe'}
            </DialogPrimitive.Description>
          </>
        )}
        <div className="pointer-events-none absolute inset-x-0 top-1/2 hidden -translate-y-1/2 justify-between px-4 md:flex">
          <Button
            variant="secondary"
            size="icon"
            aria-label="Poprzednie zdjęcie"
            onClick={() => go(-1)}
            className="pointer-events-auto"
          >
            <Icon icon={ChevronLeft} />
          </Button>
          <Button
            variant="secondary"
            size="icon"
            aria-label="Następne zdjęcie"
            onClick={() => go(1)}
            className="pointer-events-auto"
          >
            <Icon icon={ChevronRight} />
          </Button>
        </div>
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  )
}
