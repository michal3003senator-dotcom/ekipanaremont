import { ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { redirect } from 'next/navigation'

import { Badge } from '@/components/ui/Badge'
import { Icon } from '@/components/ui/Icon'
import { getPanel } from '@/lib/panel/context'
import { profileGaps, STATUS_COPY } from '@/lib/panel/profile'
import { countPhotos } from '@/lib/panel/queries'

import { PanelHeading } from '../_components/PanelSection'
import { SubmitForReview } from '../_components/SubmitForReview'

const nameOf = (value: unknown) =>
  value && typeof value === 'object' && 'name' in value ? String(value.name) : null

export default async function ProfilePage() {
  const { firm, payload } = await getPanel('/panel/profil')
  if (!firm) redirect('/panel/profil/nowy')
  const gaps = profileGaps(firm, await countPhotos(payload, firm.id))
  const services = (firm.services ?? []).map(nameOf).filter(Boolean)
  const area = (firm.serviceArea ?? []).map(nameOf).filter(Boolean)
  const sections = [
    {
      href: '/panel/profil/nowy?krok=uslugi&powrot=profil',
      label: 'Usługi i obszar',
      value: [services.slice(0, 4).join(', '), area.length ? `${area.length} miejscowości` : null]
        .filter(Boolean)
        .join(' · '),
    },
    {
      href: '/panel/profil/nowy?krok=o-firmie&powrot=profil',
      label: 'O firmie',
      value: firm.shortDescription,
    },
    { href: '/panel/realizacje', label: 'Realizacje', value: null },
  ]

  return (
    <>
      <PanelHeading title="Profil firmy">
        <div className="flex flex-wrap items-center gap-3">
          <Badge tone={firm.status === 'active' ? 'success' : 'neutral'}>
            {STATUS_COPY[firm.status].label}
          </Badge>
          <p className="text-small text-text-muted">
            NIP <span className="font-data tabular-nums">{firm.nip}</span>
            {firm.registryVerifiedAt
              ? ' · zweryfikowany w rejestrze'
              : ' · do weryfikacji przez moderatora'}
          </p>
        </div>
      </PanelHeading>
      <ul className="flex flex-col border-t border-line">
        {sections.map((section) => (
          <li key={section.href} className="border-b border-line">
            <Link href={section.href} className="flex min-h-16 items-center gap-4 py-3">
              <span className="flex min-w-0 flex-1 flex-col">
                <span className="font-medium">{section.label}</span>
                <span className="truncate text-small text-text-muted">
                  {section.value || 'Do uzupełnienia'}
                </span>
              </span>
              <Icon icon={ChevronRight} className="size-5 text-text-muted" />
            </Link>
          </li>
        ))}
      </ul>
      {(firm.status === 'draft' || firm.status === 'rejected') && (
        <div className="mt-8 flex flex-col gap-3">
          {gaps.length > 0 && (
            <p className="text-small text-text-muted">
              Przed wysłaniem: {gaps.map((gap) => gap.label.toLowerCase()).join(', ')}.
            </p>
          )}
          <SubmitForReview disabled={gaps.length > 0} />
        </div>
      )}
    </>
  )
}
