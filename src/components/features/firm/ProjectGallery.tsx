'use client'

import dynamic from 'next/dynamic'
import { Dialog as DialogPrimitive } from 'radix-ui'
import { useRef, useState } from 'react'

import { projectCaption as caption } from './caption'
import { FirmPhoto } from './FirmPhoto'
import type { Project } from './types'

const loadViewer = () => import('./GalleryViewer').then((module) => module.GalleryViewer)
// Powiększenie (z biblioteką gestów) dociąga się dopiero przy pierwszym otwarciu – lżejsza strona.
const GalleryViewer = dynamic(loadViewer, { ssr: false })

/** Realizacje firmy: siatka 3:2 i powiększenie z przesuwaniem palcem, strzałkami i Esc (SPEC 3.2). */
export function ProjectGallery({ projects }: { projects: readonly Project[] }) {
  const [index, setIndex] = useState(0)
  const [opened, setOpened] = useState(false)
  const thumbnails = useRef<Array<HTMLButtonElement | null>>([])

  return (
    <DialogPrimitive.Root onOpenChange={(open) => open && setOpened(true)}>
      <ul
        onPointerEnter={() => void loadViewer()}
        className="grid grid-cols-2 gap-2 md:grid-cols-3 md:gap-4"
      >
        {projects.map((project, position) => (
          <li key={project.id}>
            <DialogPrimitive.Trigger
              ref={(element) => {
                thumbnails.current[position] = element
              }}
              onClick={() => setIndex(position)}
              aria-label={`Powiększ: ${caption(project)}`}
              className="group block w-full cursor-zoom-in overflow-hidden rounded-control"
            >
              <FirmPhoto
                photo={project.photo}
                sizes="(min-width: 768px) 33vw, 50vw"
                className="aspect-3/2"
              />
            </DialogPrimitive.Trigger>
          </li>
        ))}
      </ul>
      {opened && (
        <GalleryViewer
          projects={projects}
          index={index}
          onIndexChange={setIndex}
          onCloseFocus={() => thumbnails.current[index]?.focus()}
        />
      )}
    </DialogPrimitive.Root>
  )
}
