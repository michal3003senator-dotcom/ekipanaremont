import Image from 'next/image'
import { ViewTransition } from 'react'

import { cn } from '@/lib/cn'

import type { FirmPhotoData } from './types'

type Props = {
  photo?: FirmPhotoData
  /** Inicjały pokazywane, gdy firma nie dodała jeszcze zdjęć. */
  fallback?: string
  sizes: string
  /** Wspólna nazwa zdjęcia karty i nagłówka profilu: przejście View Transitions (DESIGN §6). */
  transitionName?: string
  eager?: boolean
  className?: string
}

/** Zdjęcie realizacji: stałe proporcje, rozmyty podgląd, powiększenie o 3% przy najechaniu na kartę. */
export function FirmPhoto({ photo, fallback, sizes, transitionName, eager, className }: Props) {
  const image = !photo ? (
    <div
      className={cn(
        'relative flex items-center justify-center overflow-hidden bg-surface-2',
        className,
      )}
      aria-hidden="true"
    >
      <span className="font-display text-h2 font-medium text-text-muted">{fallback}</span>
    </div>
  ) : (
    <div className={cn('photo-frame relative overflow-hidden bg-surface-2', className)}>
      <Image
        src={photo.src}
        alt={photo.alt}
        fill
        sizes={sizes}
        placeholder={typeof photo.src === 'string' ? 'empty' : 'blur'}
        loading={eager ? 'eager' : 'lazy'}
        fetchPriority={eager ? 'high' : undefined}
        className="object-cover transition-transform duration-400 ease-standard group-hover:scale-103"
      />
      {photo.demo && (
        <span className="absolute start-3 top-3 rounded-badge bg-scrim px-2 py-1 text-micro text-on-scrim">
          zdjęcie poglądowe
        </span>
      )}
    </div>
  )

  if (!transitionName) return image
  return (
    <ViewTransition name={transitionName} share="firm-photo" default="none">
      {image}
    </ViewTransition>
  )
}

export const firmPhotoTransition = (slug: string) => `firm-photo-${slug}`

/** „Płytka i Fuga” → „PI” – zastępuje zdjęcie, gdy firma nie ma jeszcze realizacji. */
export const initialsOf = (name: string) =>
  name
    .split(/\s+/)
    .filter((word) => word.length > 1)
    .slice(0, 2)
    .map((word) => word.charAt(0).toUpperCase())
    .join('')
