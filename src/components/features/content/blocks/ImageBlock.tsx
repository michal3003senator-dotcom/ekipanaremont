import Image from 'next/image'

import type { Media } from '@/payload-types'

/** Zdjęcie w treści: stałe proporcje z pliku, podpis pod spodem. */
export function ImageBlock({ image, caption }: { image: unknown; caption?: string | null }) {
  if (!image || typeof image !== 'object') return null
  const media = image as Media
  const src = media.sizes?.large?.url ?? media.url
  if (!src || !media.width || !media.height) return null
  return (
    <figure className="flex flex-col gap-2">
      <Image
        src={src}
        alt={media.alt}
        width={media.width}
        height={media.height}
        sizes="(min-width: 768px) 768px, 100vw"
        className="h-auto w-full rounded-card bg-surface-2"
      />
      {caption && <figcaption className="text-small text-text-muted">{caption}</figcaption>}
    </figure>
  )
}
