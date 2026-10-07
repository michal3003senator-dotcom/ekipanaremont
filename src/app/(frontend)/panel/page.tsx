import { ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { redirect } from 'next/navigation'

import { Badge } from '@/components/ui/Badge'
import { Icon } from '@/components/ui/Icon'
import {
  addDays,
  daysBetween,
  formatInstantDate,
  formatShortDate,
  todayInWarsaw,
  calendarDateOf,
} from '@/lib/format/date'
import { formatCount, formatNumber } from '@/lib/format/number'
import { availabilityState } from '@/lib/panel/availability'
import { getPanel } from '@/lib/panel/context'
import { profileGaps, STATUS_COPY } from '@/lib/panel/profile'
import { countPhotos } from '@/lib/panel/queries'
import { getSettings } from '@/lib/settings'

import { ConfirmAvailability } from './_components/ConfirmAvailability'
import { PanelHeading, PanelSection } from './_components/PanelSection'
import { SubmitForReview } from './_components/SubmitForReview'
import { INQUIRY_STATUS } from './zapytania/status'

export default async function DashboardPage() {
  const panel = await getPanel()
  const { firm, payload, as } = panel
  if (!firm) redirect('/panel/profil/nowy')

  const today = todayInWarsaw()
  const settings = await getSettings()
  const expiryDays = settings.availabilityExpiryDays ?? 14
  const availability = availabilityState(firm.availability, today, expiryDays)
  const gaps = profileGaps(firm, await countPhotos(payload, firm.id))
  const editable = firm.status === 'draft' || firm.status === 'rejected'
  const since = addDays(today, -30)

  const [inquiries, stats] = await Promise.all([
    payload.find({
      collection: 'inquiries',
      where: { firm: { equals: firm.id } },
      sort: '-createdAt',
      limit: 3,
      depth: 1,
      ...as,
    }),
    payload.find({
      collection: 'firmStatsDaily',
      where: { firm: { equals: firm.id }, date: { greater_than_equal: since } },
      pagination: false,
      depth: 0,
      ...as,
    }),
  ])
  const totals = stats.docs.reduce(
    (sum, day) => ({
      views: sum.views + (day.views ?? 0),
      phone: sum.phone + (day.phoneReveals ?? 0),
      inquiries: sum.inquiries + (day.inquiries ?? 0),
    }),
    { views: 0, phone: 0, inquiries: 0 },
  )
  const trialDays = firm.trialEndsAt ? daysBetween(today, calendarDateOf(firm.trialEndsAt)) : null
  const status = STATUS_COPY[firm.status]

  return (
    <>
      <PanelHeading title={firm.name}>
        <div className="flex flex-wrap items-center gap-3">
          <Badge
            tone={
              firm.status === 'active'
                ? 'success'
                : firm.status === 'rejected' || firm.status === 'suspended'
                  ? 'danger'
                  : 'neutral'
            }
          >
            {status.label}
          </Badge>
          <p className="text-small text-text-muted">{status.detail}</p>
        </div>
        {firm.status === 'rejected' && firm.moderationReason && (
          <p className="mt-2 border-s-2 border-danger ps-4 text-small">„{firm.moderationReason}”</p>
        )}
      </PanelHeading>

      <div className="flex flex-col gap-10">
        {editable && (
          <PanelSection title={gaps.length ? 'Do uzupełnienia' : 'Profil gotowy'}>
            {gaps.length > 0 ? (
              <ul className="flex flex-col border-t border-line">
                {gaps.map((gap) => (
                  <li key={gap.key} className="border-b border-line">
                    <Link
                      href={gap.href}
                      className="flex min-h-12 items-center justify-between gap-4 py-3 text-body hover:text-accent-soft"
                    >
                      {gap.label}
                      <Icon icon={ChevronRight} className="size-5 text-text-muted" />
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-small text-text-muted">
                Wszystko jest na miejscu. Po wysłaniu moderator sprawdzi profil.
              </p>
            )}
            <SubmitForReview disabled={gaps.length > 0} />
          </PanelSection>
        )}

        <PanelSection title="Najbliższy wolny termin">
          <ConfirmAvailability
            today={today}
            date={availability.date}
            confirmedOn={availability.confirmedOn}
            expiresOn={availability.expiresOn}
            expired={availability.expired}
            expiryDays={expiryDays}
            primary={!editable}
          />
        </PanelSection>

        <PanelSection
          title="Zapytania"
          action={
            <Link
              href="/panel/zapytania"
              className="text-small text-text-muted underline underline-offset-4 hover:text-text"
            >
              Wszystkie
            </Link>
          }
        >
          {inquiries.docs.length === 0 ? (
            <p className="text-small text-text-muted">
              Jeszcze nie ma zapytań. Pojawią się tu, gdy klient napisze z Twojego profilu.
            </p>
          ) : (
            <ul className="flex flex-col border-t border-line">
              {inquiries.docs.map((inquiry) => (
                <li key={inquiry.id} className="border-b border-line">
                  <Link
                    href={`/panel/zapytania/${inquiry.id}`}
                    className="flex min-h-14 items-center justify-between gap-4 py-3"
                  >
                    <span className="flex min-w-0 flex-col">
                      <span className="truncate font-medium">
                        {typeof inquiry.service === 'object' && inquiry.service
                          ? inquiry.service.name
                          : 'Zapytanie'}
                        {typeof inquiry.locality === 'object' && inquiry.locality
                          ? `, ${inquiry.locality.name}`
                          : ''}
                      </span>
                      <span className="text-small text-text-muted">
                        {formatShortDate(calendarDateOf(inquiry.createdAt))}
                      </span>
                    </span>
                    <Badge tone={inquiry.status === 'new' ? 'success' : 'outline'}>
                      {INQUIRY_STATUS[inquiry.status]}
                    </Badge>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </PanelSection>

        <PanelSection title="Ostatnie 30 dni">
          <dl className="grid grid-cols-3 border-y border-line">
            {[
              ['Wyświetlenia profilu', totals.views],
              ['Pokazania numeru', totals.phone],
              ['Zapytania', totals.inquiries],
            ].map(([label, value], index) => (
              <div
                key={label}
                className={index > 0 ? 'border-s border-line ps-4 py-4' : 'py-4 pe-4'}
              >
                <dt className="text-micro text-text-muted">{label}</dt>
                <dd className="font-data text-h3 font-medium tabular-nums">
                  {formatNumber(Number(value))}
                </dd>
              </div>
            ))}
          </dl>
        </PanelSection>

        {trialDays !== null && firm.subscriptionStatus === 'trial' && (
          <PanelSection title="Okres próbny">
            <p className="text-body">
              {trialDays > 0 ? (
                <>
                  Zostało{' '}
                  <span className="font-data font-medium tabular-nums">
                    {formatCount(trialDays, { one: 'dzień', few: 'dni', many: 'dni' })}
                  </span>{' '}
                  – do {formatInstantDate(firm.trialEndsAt!)}.
                </>
              ) : (
                'Okres próbny się zakończył.'
              )}
            </p>
          </PanelSection>
        )}
      </div>
    </>
  )
}
