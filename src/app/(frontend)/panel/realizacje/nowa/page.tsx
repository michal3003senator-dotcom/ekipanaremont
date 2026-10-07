import Link from 'next/link'
import { redirect } from 'next/navigation'

import { getPanel } from '@/lib/panel/context'

import { PanelHeading } from '../../_components/PanelSection'
import { serviceOptions } from '../data'
import { ProjectForm } from '../ProjectForm'

export default async function NewProjectPage({
  searchParams,
}: {
  searchParams: Promise<{ powrot?: string }>
}) {
  const { firm, payload } = await getPanel('/panel/realizacje/nowa')
  if (!firm) redirect('/panel/profil/nowy')
  const fromWizard = (await searchParams).powrot === 'kreator'
  return (
    <>
      <Link
        href={fromWizard ? '/panel/profil/nowy?krok=realizacje' : '/panel/realizacje'}
        className="mb-4 inline-flex min-h-11 items-center text-small text-text-muted hover:text-text"
      >
        ← {fromWizard ? 'Profil firmy' : 'Realizacje'}
      </Link>
      <PanelHeading
        title="Nowa realizacja"
        lead="Najpierw krótki opis, w następnym kroku zdjęcia."
      />
      <ProjectForm
        initial={{ title: '' }}
        services={await serviceOptions(payload)}
        locality={null}
        returnTo={fromWizard ? 'kreator' : undefined}
      />
    </>
  )
}
