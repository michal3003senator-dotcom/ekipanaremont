import { Camera } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'

import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { idOf } from '@/access'
import { getPanel } from '@/lib/panel/context'
import { MIN_PROFILE_PHOTOS, profileGaps, STATUS_COPY } from '@/lib/panel/profile'
import { countPhotos } from '@/lib/panel/queries'
import { toOption } from '@/lib/localities'
import { formatCount } from '@/lib/format/number'

import { PanelHeading } from '../../_components/PanelSection'
import { SubmitForReview } from '../../_components/SubmitForReview'
import { AboutStep } from './AboutStep'
import { NipStep } from './NipStep'
import { type ServiceGroup, ServicesStep } from './ServicesStep'
import { Stepper } from './Stepper'
import { nextStep, stepHref, WIZARD_STEPS, type WizardStep } from './steps'

export const metadata: Metadata = { title: 'Profil firmy – Ekipa na Termin' }

type Props = { searchParams: Promise<{ krok?: string; powrot?: string }> }

const ids = (values: unknown[] | null | undefined) =>
  (values ?? []).map(idOf).filter((value): value is string => Boolean(value))

export default async function ProfileWizardPage({ searchParams }: Props) {
  const panel = await getPanel('/panel/profil/nowy')
  const { firm, payload } = panel
  const { krok: requested, powrot } = await searchParams
  // Edycja z ekranu profilu wraca do niego zamiast iść do kolejnego kroku.
  const after = (key: WizardStep) =>
    powrot === 'profil' ? '/panel/profil' : stepHref(nextStep(key))
  const known = WIZARD_STEPS.some((step) => step.key === requested)
  // Bez profilu zawsze krok NIP; z profilem – domyślnie usługi.
  const step: WizardStep = !firm
    ? 'nip'
    : known && requested !== 'nip'
      ? (requested as WizardStep)
      : 'uslugi'

  const photos = firm ? await countPhotos(payload, firm.id) : 0
  const gaps = firm ? profileGaps(firm, photos) : []
  const done = new Set<WizardStep>()
  if (firm) done.add('nip')
  if (firm && !gaps.some((gap) => gap.key === 'services' || gap.key === 'area')) done.add('uslugi')
  if (firm?.shortDescription) done.add('o-firmie')
  if (photos >= MIN_PROFILE_PHOTOS) done.add('realizacje')
  if (firm && firm.status !== 'draft' && firm.status !== 'rejected') done.add('wyslij')

  return (
    <>
      <Stepper current={step} done={done} />
      {step === 'nip' && (
        <>
          <PanelHeading
            title="Zacznijmy od NIP"
            lead="Sprawdzimy firmę w CEIDG, KRS i na Białej liście VAT i uzupełnimy nazwę."
          />
          <NipStep />
        </>
      )}
      {step === 'uslugi' && firm && (
        <ServicesView firm={firm} payload={payload} next={after('uslugi')} />
      )}
      {step === 'o-firmie' && firm && (
        <>
          <PanelHeading title="O firmie" lead="Te informacje klienci porównują, zanim napiszą." />
          <AboutStep
            next={after('o-firmie')}
            initial={{
              shortDescription: firm.shortDescription ?? '',
              phone: firm.phone ?? '',
              website: firm.website ?? '',
              vatInvoice: firm.vatInvoice ?? false,
              warrantyMonths: firm.warrantyMonths ?? undefined,
              yearsExperience: firm.yearsExperience ?? undefined,
              teamSize: firm.teamSize ?? undefined,
            }}
          />
        </>
      )}
      {step === 'realizacje' && firm && (
        <>
          <PanelHeading
            title="Realizacje"
            lead={`Zdjęcia prac to najważniejsza część profilu. Potrzebujemy co najmniej ${MIN_PROFILE_PHOTOS} – możesz je zrobić telefonem na budowie.`}
          />
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-4 rounded-card border border-line bg-surface-1 p-5">
              <Icon icon={Camera} className="size-6 text-text-muted" />
              <p className="text-body">
                Masz{' '}
                <span className="font-data font-medium tabular-nums">
                  {formatCount(photos, { one: 'zdjęcie', few: 'zdjęcia', many: 'zdjęć' })}
                </span>
                {photos < MIN_PROFILE_PHOTOS
                  ? ` z ${MIN_PROFILE_PHOTOS} potrzebnych.`
                  : '. Wystarczy do wysłania profilu.'}
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button
                asChild
                variant={photos < MIN_PROFILE_PHOTOS ? 'primary' : 'secondary'}
                className="max-sm:w-full"
              >
                <Link href="/panel/realizacje/nowa?powrot=kreator">Dodaję realizację</Link>
              </Button>
              {photos >= MIN_PROFILE_PHOTOS && (
                <Button asChild variant="primary" className="max-sm:w-full">
                  <Link href={stepHref('wyslij')}>Przechodzę dalej</Link>
                </Button>
              )}
            </div>
          </div>
        </>
      )}
      {step === 'wyslij' && firm && (
        <>
          <PanelHeading
            title="Wysłanie do akceptacji"
            lead="Moderator sprawdzi profil i NIP. Okres próbny – 30 dni – startuje w dniu zatwierdzenia."
          />
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-3">
              <Badge tone={firm.status === 'active' ? 'success' : 'neutral'}>
                {STATUS_COPY[firm.status].label}
              </Badge>
              <p className="text-small text-text-muted">{STATUS_COPY[firm.status].detail}</p>
            </div>
            {gaps.length > 0 && (
              <ul className="flex flex-col border-t border-line">
                {gaps.map((gap) => (
                  <li key={gap.key} className="border-b border-line">
                    <Link
                      href={gap.href}
                      className="flex min-h-12 items-center py-3 underline-offset-4 hover:underline"
                    >
                      {gap.label}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
            {(firm.status === 'draft' || firm.status === 'rejected') && (
              <SubmitForReview disabled={gaps.length > 0} />
            )}
            {firm.status !== 'draft' && firm.status !== 'rejected' && (
              <Button asChild variant="primary" className="self-start max-sm:w-full">
                <Link href="/panel">Przechodzę do pulpitu</Link>
              </Button>
            )}
          </div>
        </>
      )}
    </>
  )
}

async function ServicesView({
  firm,
  payload,
  next,
}: {
  next: string
  firm: NonNullable<Awaited<ReturnType<typeof getPanel>>['firm']>
  payload: Awaited<ReturnType<typeof getPanel>>['payload']
}) {
  const [services, localities] = await Promise.all([
    payload.find({
      collection: 'services',
      depth: 0,
      pagination: false,
      sort: 'name',
      overrideAccess: true,
    }),
    payload.find({
      collection: 'localities',
      where: { id: { in: [...ids(firm.serviceArea), ...ids([firm.baseLocality])] } },
      depth: 2,
      pagination: false,
      overrideAccess: true,
    }),
  ])
  const byId = new Map(localities.docs.map((doc) => [doc.id, toOption(doc)]))
  const groups: ServiceGroup[] = services.docs
    .filter((service) => !service.parent)
    .map((parent) => ({
      id: parent.id,
      name: parent.name,
      children: services.docs
        .filter((child) => idOf(child.parent) === parent.id)
        .map((child) => ({ id: child.id, name: child.name })),
    }))
  const baseId = idOf(firm.baseLocality)

  return (
    <>
      <PanelHeading title="Usługi i obszar" lead="Po tym klienci znajdą Cię w wyszukiwarce." />
      <ServicesStep
        next={next}
        groups={groups}
        selected={ids(firm.services)}
        base={baseId ? (byId.get(baseId) ?? null) : null}
        area={ids(firm.serviceArea)
          .filter((id) => id !== baseId)
          .map((id) => byId.get(id))
          .filter((option) => option !== undefined)}
      />
    </>
  )
}
