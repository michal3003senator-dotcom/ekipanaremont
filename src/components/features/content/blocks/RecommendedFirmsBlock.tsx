import Link from 'next/link'

import { FirmCard } from '@/components/features/firm/FirmCard'
import { idOf } from '@/access'
import { searchHref } from '@/lib/search/href'
import { searchFirms } from '@/lib/search/firms'
import { allServices } from '@/lib/search/options'
import { publicContext } from '@/lib/search/context'
import { loadFirmSummaries } from '@/lib/search/summary'
import type { Locality, Service } from '@/payload-types'

type Props = { service?: unknown; locality?: unknown; limit?: number | null }

/** Polecane firmy (SPEC 3.8): wg usługi i miejscowości, od najbliższego wolnego terminu. */
export async function RecommendedFirmsBlock({ service, locality, limit }: Props) {
  const { payload, today, expiryDays } = await publicContext()
  const serviceId = idOf(service)
  const children = serviceId
    ? (await allServices(payload)).filter((item) => idOf(item.parent) === serviceId)
    : []
  const { ids } = await searchFirms(payload, {
    today,
    expiryDays,
    serviceIds: serviceId ? [serviceId, ...children.map((child) => child.id)] : undefined,
    localityId: idOf(locality) ?? undefined,
    limit: Math.min(Math.max(limit ?? 3, 1), 6),
  })
  const firms = await loadFirmSummaries(payload, ids, today, expiryDays)
  if (!firms.length) return null
  const serviceSlug = typeof service === 'object' ? (service as Service | null)?.slug : undefined
  const localitySlug =
    typeof locality === 'object' ? (locality as Locality | null)?.slug : undefined

  return (
    <section aria-label="Polecane firmy" className="flex flex-col gap-4">
      <div className="flex items-baseline justify-between gap-4">
        <h2 className="font-display text-h3 font-medium">Firmy z wolnym terminem</h2>
        <Link
          href={searchHref(
            {},
            { usluga: serviceSlug ?? undefined, gdzie: localitySlug ?? undefined },
          )}
          className="shrink-0 text-small text-accent-soft underline underline-offset-4"
        >
          Wszystkie firmy
        </Link>
      </div>
      <ul className="flex flex-col gap-4">
        {firms.map((firm) => (
          <li key={firm.slug}>
            <FirmCard firm={firm} today={today} />
          </li>
        ))}
      </ul>
    </section>
  )
}
