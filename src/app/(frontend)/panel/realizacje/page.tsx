import { Images } from 'lucide-react'
import Link from 'next/link'
import { redirect } from 'next/navigation'

import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/States'
import { getPanel } from '@/lib/panel/context'
import { MAX_PROJECTS } from '@/collections/Projects'

import { PanelHeading } from '../_components/PanelSection'
import { toPhoto } from './data'
import { ProjectsList } from './ProjectsList'

export default async function ProjectsPage() {
  const { firm, payload, as } = await getPanel('/panel/realizacje')
  if (!firm) redirect('/panel/profil/nowy')
  const { docs } = await payload.find({
    collection: 'projects',
    where: { firm: { equals: firm.id } },
    sort: 'order',
    depth: 1,
    pagination: false,
    ...as,
  })
  const rows = docs.map((project) => ({
    id: project.id,
    title: project.title,
    photos: project.images?.length ?? 0,
    cover: toPhoto(project.images?.[0])?.url ?? null,
  }))

  return (
    <>
      <PanelHeading
        title="Realizacje"
        lead="Najlepsze prace na górze – w tej kolejności zobaczą je klienci."
      >
        {docs.length < MAX_PROJECTS && (
          <Button asChild variant="primary" className="mt-2 self-start max-sm:w-full">
            <Link href="/panel/realizacje/nowa">Dodaję realizację</Link>
          </Button>
        )}
      </PanelHeading>
      {rows.length === 0 ? (
        <EmptyState
          icon={Images}
          title="Jeszcze nie ma realizacji"
          description="Dodaj pierwszą – wystarczą 3 zdjęcia zrobione telefonem."
        />
      ) : (
        <ProjectsList initial={rows} />
      )}
    </>
  )
}
