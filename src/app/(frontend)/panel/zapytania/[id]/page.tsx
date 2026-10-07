import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'

import { formatInstantDate } from '@/lib/format/date'
import { getPanel } from '@/lib/panel/context'
import { BUDGET_RANGES } from '@/lib/inquiry/options'

import { PanelHeading, PanelSection } from '../../_components/PanelSection'
import { InquiryActions } from './InquiryActions'

const BUDGET: Record<string, string> = { ...BUDGET_RANGES, unknown: 'Klient nie wie' }

const nameOf = (value: unknown) =>
  value && typeof value === 'object' && 'name' in value ? String(value.name) : null

export default async function InquiryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { firm, payload, as } = await getPanel(`/panel/zapytania/${id}`)
  if (!firm) redirect('/panel/profil/nowy')
  const inquiry = await payload.findByID({
    collection: 'inquiries',
    id,
    depth: 1,
    disableErrors: true,
    ...as,
  })
  if (!inquiry) notFound()

  const title = [nameOf(inquiry.service) ?? 'Zapytanie', nameOf(inquiry.locality)]
    .filter(Boolean)
    .join(', ')
  const facts = [
    ['Wysłane', formatInstantDate(inquiry.createdAt)],
    ['Planowany termin', inquiry.timeframe],
    ['Budżet', inquiry.budgetRange ? BUDGET[inquiry.budgetRange] : null],
    ['Klient', inquiry.clientName],
    ['Telefon', inquiry.clientPhone],
    ['E-mail', inquiry.clientEmail],
  ].filter((entry): entry is [string, string] => Boolean(entry[1]))

  return (
    <>
      <Link
        href="/panel/zapytania"
        className="mb-4 inline-flex min-h-11 items-center text-small text-text-muted hover:text-text"
      >
        ← Zapytania
      </Link>
      <PanelHeading title={title} />
      <div className="flex flex-col gap-10">
        <InquiryActions
          id={inquiry.id}
          status={inquiry.status}
          phone={inquiry.clientPhone}
          email={inquiry.clientEmail}
          subject={`Odpowiedź na zapytanie: ${title}`}
        />
        <PanelSection title="Opis prac">
          <p className="text-body whitespace-pre-line">{inquiry.description}</p>
        </PanelSection>
        <PanelSection title="Szczegóły">
          <dl className="flex flex-col border-t border-line">
            {facts.map(([label, value]) => (
              <div
                key={label}
                className="flex flex-wrap justify-between gap-x-6 gap-y-1 border-b border-line py-3"
              >
                <dt className="text-small text-text-muted">{label}</dt>
                <dd className="text-body break-all">{value}</dd>
              </div>
            ))}
          </dl>
        </PanelSection>
      </div>
    </>
  )
}
