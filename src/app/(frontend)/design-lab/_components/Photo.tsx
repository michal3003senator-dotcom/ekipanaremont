import Image, { type StaticImageData } from 'next/image'

import { cx } from '@/lib/cx'

type Props = {
  photo: StaticImageData
  alt: string
  sizes: string
  /** Zdjęcie widoczne od razu (LCP): bez leniwego ładowania. */
  eager?: boolean
  /** Podpis „zdjęcie poglądowe” – wymagany przy zdjęciach spoza realizacji firm (DESIGN §7). */
  label?: boolean
  className?: string
}

export function Photo({ photo, alt, sizes, eager, label = true, className }: Props) {
  return (
    <div className={cx('relative overflow-hidden bg-surface-2', className)}>
      <Image
        src={photo}
        alt={alt}
        sizes={sizes}
        placeholder="blur"
        loading={eager ? 'eager' : 'lazy'}
        fetchPriority={eager ? 'high' : undefined}
        className="size-full object-cover transition-transform duration-400 ease-standard group-hover:scale-103"
      />
      {label && (
        <span className="absolute start-3 top-3 rounded-badge bg-scrim px-2 py-1 text-micro text-on-scrim">
          zdjęcie poglądowe
        </span>
      )}
    </div>
  )
}
