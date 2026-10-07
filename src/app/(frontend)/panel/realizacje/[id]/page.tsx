import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'

import { Button } from '@/components/ui/Button'
import { idOf } from '@/access'
import { toOption } from '@/lib/localities'
import { getPanel } from '@/lib/panel/context'
import type { Locality } from '@/payload-types'

import { PanelHeading, PanelSection } from '../../_components/PanelSection'
import { serviceOptions, toPhoto } from '../data'
import { PhotoManager } from '../PhotoManager'
import { ProjectForm } from '../ProjectForm'
import { DeleteProject } from './DeleteProject'

type Props = { params: Promise<{ id: string }>; searchParams: Promise<{ powrot?: string }> }

export default async function ProjectPage({ params, searchParams }: Props) {
  const { id } = await params
  const { firm, payload, as } = await getPanel(`/panel/realizacje/${id}`)
  if (!firm) redirect('/panel/profil/nowy')
  const project = await payload.findByID({
    collection: 'projects',
    id,
    depth: 1,
    disableErrors: true,
    ...as,
  })
  if (!project) notFound()
  const fromWizard = (await searchParams).powrot === 'kreator'
  const localityId = idOf(project.locality)
  const locality = localityId
    ? await payload.findByID({
        collection: 'localities',
        id: localityId,
        depth: 2,
        overrideAccess: true,
        disableErrors: true,
      })
    : null

  return (
    <>
      <Link
        href={fromWizard ? '/panel/profil/nowy?krok=realizacje' : '/panel/realizacje'}
        className="mb-4 inline-flex min-h-11 items-center text-small text-text-muted hover:text-text"
      >
        ← {fromWizard ? 'Profil firmy' : 'Realizacje'}
      </Link>
      <PanelHeading title={project.title} />
      <div className="flex flex-col gap-10">
        <PanelSection title="Zdjęcia">
          <PhotoManager
            projectId={project.id}
            initial={(project.images ?? []).map(toPhoto).filter((photo) => photo !== null)}
          />
          {fromWizard && (
            <Button asChild variant="secondary" className="self-start max-sm:w-full">
              <Link href="/panel/profil/nowy?krok=realizacje">Wracam do profilu</Link>
            </Button>
          )}
        </PanelSection>
        <PanelSection title="Opis">
          <ProjectForm
            id={project.id}
            initial={{
              title: project.title,
              service: idOf(project.service) ?? undefined,
              completedMonth: project.completedMonth ?? undefined,
              description: project.description ?? undefined,
            }}
            services={await serviceOptions(payload)}
            locality={locality ? toOption(locality as Locality) : null}
          />
        </PanelSection>
        <PanelSection title="Usunięcie">
          <DeleteProject id={project.id} />
        </PanelSection>
      </div>
    </>
  )
}
