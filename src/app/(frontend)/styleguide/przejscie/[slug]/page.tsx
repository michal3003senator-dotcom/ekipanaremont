import { notFound } from 'next/navigation'

import { FirmProfileHeader } from '@/components/features/firm/FirmProfileHeader'
import { ProfileActions } from '@/components/features/firm/ProfileActions'
import { ProjectGallery } from '@/components/features/firm/ProjectGallery'
import { Breadcrumbs } from '@/components/ui/Breadcrumbs'

import { DEMO_TODAY, FIRMS, PROJECTS } from '../../_data'

type Props = { params: Promise<{ slug: string }> }

export default async function TransitionProfilePage({ params }: Props) {
  const { slug } = await params
  const firm = FIRMS.find((item) => item.slug === slug)
  if (!firm) notFound()

  return (
    <div className="flex flex-col gap-8 py-8 max-lg:pb-40 md:py-12">
      <Breadcrumbs
        items={[
          { label: 'Przejście', href: '/styleguide/przejscie' },
          { label: firm.locality },
          { label: firm.name },
        ]}
      />
      <FirmProfileHeader
        firm={firm}
        today={DEMO_TODAY}
        actions={<ProfileActions slug={firm.slug} hasPhone />}
      />
      <section aria-labelledby="realizacje" className="border-t border-line pt-8">
        <h2 id="realizacje" className="font-display text-h2 font-medium">
          Realizacje <span className="font-data text-h3 text-text-muted">{PROJECTS.length}</span>
        </h2>
        <div className="mt-6">
          <ProjectGallery projects={PROJECTS} />
        </div>
      </section>
    </div>
  )
}
