'use client'

import dynamic from 'next/dynamic'
import { Dialog as DialogPrimitive } from 'radix-ui'
import { useRef, useState } from 'react'

import { projectCaption as caption } from './caption'
import { FirmPhoto } from './FirmPhoto'
import type { GalleryItem, Project } from './types'

const loadViewer = () => import('./GalleryViewer').then((module) => module.GalleryViewer)
// Powiększenie (z biblioteką gestów) dociąga się dopiero przy pierwszym otwarciu – lżejsza strona.
const GalleryViewer = dynamic(loadViewer, { ssr: false })

/** Realizacje firmy (SPEC 3.2): podpis „tytuł, miejscowość · miesiąc”. */
export function ProjectGallery({ projects }: { projects: readonly Project[] }) {
  return (
    <PhotoGallery
      items={projects.map((project) => ({
        id: project.id,
        photo: project.photo,
        caption: caption(project),
      }))}
    />
  )
}

/** Galeria: siatka 3:2 i powiększenie z przesuwaniem palcem, strzałkami i Esc. */
export function PhotoGallery({ items }: { items: readonly GalleryItem[] }) {
  const [index, setIndex] = useState(0)
  const [opened, setOpened] = useState(false)
  const thumbnails = useRef<Array<HTMLButtonElement | null>>([])

  return (
    <DialogPrimitive.Root onOpenChange={(open) => open && setOpened(true)}>
      <ul
        onPointerEnter={() => void loadViewer()}
        className="grid grid-cols-2 gap-2 md:grid-cols-3 md:gap-4"
      >
        {items.map((item, position) => (
          <li key={item.id}>
            <DialogPrimitive.Trigger
              ref={(element) => {
                thumbnails.current[position] = element
              }}
              onClick={() => setIndex(position)}
              aria-label={`Powiększ: ${item.caption}`}
              className="group block w-full cursor-zoom-in overflow-hidden rounded-control"
            >
              <FirmPhoto
                photo={item.photo}
                sizes="(min-width: 768px) 33vw, 50vw"
                className="aspect-3/2"
              />
            </DialogPrimitive.Trigger>
          </li>
        ))}
      </ul>
      {opened && (
        <GalleryViewer
          items={items}
          index={index}
          onIndexChange={setIndex}
          onCloseFocus={() => thumbnails.current[index]?.focus()}
        />
      )}
    </DialogPrimitive.Root>
  )
}
