import { Inbox } from 'lucide-react'
import Link from 'next/link'
import { redirect } from 'next/navigation'

import { Badge } from '@/components/ui/Badge'
import { EmptyState } from '@/components/ui/States'
import { cn } from '@/lib/cn'
import { calendarDateOf, formatShortDate } from '@/lib/format/date'
import { getPanel } from '@/lib/panel/context'
import type { Inquiry } from '@/payload-types'

import { PanelHeading } from '../_components/PanelSection'
import { INQUIRY_STATUS } from './status'

const FILTERS = [
  { key: 'aktywne', label: 'Do obsługi', statuses: ['new', 'in_contact'] },
  { key: 'zamkniete', label: 'Zamknięte', statuses: ['closed'] },
  { key: 'spam', label: 'Spam', statuses: ['spam'] },
] as const

type Props = { searchParams: Promise<{ widok?: string }> }

const nameOf = (value: unknown) =>
  value && typeof value === 'object' && 'name' in value ? String(value.name) : null

export default async function InquiriesPage({ searchParams }: Props) {
  const { firm, payload, as } = await getPanel('/panel/zapytania')
  if (!firm) redirect('/panel/profil/nowy')
  const { widok } = await searchParams
  const view = FILTERS.find((filter) => filter.key === widok) ?? FILTERS[0]
  const { docs } = await payload.find({
    collection: 'inquiries',
    where: { firm: { equals: firm.id }, status: { in: [...view.statuses] } },
    sort: '-createdAt',
    limit: 50,
    depth: 1,
    ...as,
  })

  return (
    <>
      <PanelHeading
        title="Zapytania"
        lead="Klient czeka na odpowiedź – zadzwoń albo napisz najszybciej, jak możesz."
      />
      <nav aria-label="Widok zapytań" className="mb-6 flex gap-2 overflow-x-auto">
        {FILTERS.map((filter) => (
          <Link
            key={filter.key}
            href={`/panel/zapytania?widok=${filter.key}`}
            aria-current={filter.key === view.key ? 'page' : undefined}
            className={cn(
              'flex h-11 shrink-0 items-center rounded-control border px-4 text-small',
              filter.key === view.key
                ? 'border-text text-text'
                : 'border-line text-text-muted hover:text-text',
            )}
          >
            {filter.label}
          </Link>
        ))}
      </nav>
      {docs.length === 0 ? (
        <EmptyState
          icon={Inbox}
          title={view.key === 'aktywne' ? 'Nie ma zapytań do obsługi' : 'Pusto'}
          description={
            view.key === 'aktywne'
              ? 'Nowe zapytania od klientów pojawią się tutaj. Dostaniesz też e-mail.'
              : 'Nic tu nie ma.'
          }
        />
      ) : (
        <ul className="flex flex-col border-t border-line">
          {docs.map((inquiry: Inquiry) => (
            <li key={inquiry.id} className="border-b border-line">
              <Link
                href={`/panel/zapytania/${inquiry.id}`}
                className="flex min-h-16 items-center justify-between gap-4 py-3"
              >
                <span className="flex min-w-0 flex-col gap-0.5">
                  <span className="truncate font-medium">
                    {nameOf(inquiry.service) ?? 'Zapytanie'}
                    {nameOf(inquiry.locality) ? `, ${nameOf(inquiry.locality)}` : ''}
                  </span>
                  <span className="truncate text-small text-text-muted">{inquiry.description}</span>
                </span>
                <span className="flex shrink-0 flex-col items-end gap-1">
                  <Badge tone={inquiry.status === 'new' ? 'success' : 'outline'}>
                    {INQUIRY_STATUS[inquiry.status]}
                  </Badge>
                  <time dateTime={inquiry.createdAt} className="text-micro text-text-muted">
                    {formatShortDate(calendarDateOf(inquiry.createdAt))}
                  </time>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  )
}
