'use client'

import Link from 'next/link'
import { useState, useTransition } from 'react'

import { SortableList } from '@/components/features/sortable/SortableList'
import { toast } from '@/components/ui/Toast'

import { reorderProjectsAction } from './actions'

export type ProjectRow = { id: string; title: string; photos: number; cover: string | null }

export function ProjectsList({ initial }: { initial: ProjectRow[] }) {
  const [projects, setProjects] = useState(initial)
  const [, startTransition] = useTransition()
  const commit = (items: ProjectRow[]) =>
    startTransition(async () => {
      const result = await reorderProjectsAction({ ids: items.map((item) => item.id) })
      if (!result.ok)
        toast({ title: 'Kolejność niezapisana', description: result.message, tone: 'danger' })
    })

  return (
    <SortableList
      items={projects}
      getId={(project) => project.id}
      getLabel={(project) => project.title}
      onReorder={setProjects}
      onCommit={commit}
      renderItem={(project) => (
        <Link href={`/panel/realizacje/${project.id}`} className="flex items-center gap-3">
          {project.cover ? (
            // eslint-disable-next-line @next/next/no-img-element -- miniatura już przeskalowana przez Payload (WebP 480 px)
            <img
              src={project.cover}
              alt=""
              width={96}
              height={72}
              className="aspect-4/3 w-24 shrink-0 rounded-badge object-cover"
            />
          ) : (
            <span className="aspect-4/3 w-24 shrink-0 rounded-badge bg-surface-2" />
          )}
          <span className="flex min-w-0 flex-col">
            <span className="truncate font-medium">{project.title}</span>
            <span className="text-small text-text-muted">
              {project.photos === 0
                ? 'Bez zdjęć'
                : `${project.photos} ${project.photos === 1 ? 'zdjęcie' : project.photos < 5 ? 'zdjęcia' : 'zdjęć'}`}
            </span>
          </span>
        </Link>
      )}
    />
  )
}
