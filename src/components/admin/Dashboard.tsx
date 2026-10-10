import Link from 'next/link'
import type { Payload, PayloadRequest, Where } from 'payload'

import { isVerifiedStaff } from '@/access'
import { todayInWarsaw } from '@/lib/format/date'
import { pendingCounts } from '@/lib/moderation/queue'

type Props = { payload: Payload; user?: PayloadRequest['user'] }

const DAY_MS = 24 * 60 * 60 * 1000
const ago = (days: number) => new Date(Date.now() - days * DAY_MS).toISOString()

/** Liczby z SPEC 3.12 – tylko liczniki, bez danych osobowych. */
async function businessStats(payload: Payload) {
  const count = async (collection: 'firms' | 'inquiries', where: Where) =>
    (await payload.count({ collection, where, overrideAccess: true })).totalDocs
  const today = todayInWarsaw()
  const soon = new Date(Date.now() + 7 * DAY_MS).toISOString()
  const [newFirms, activeDates, inquiries7, inquiries30, trialEnding] = await Promise.all([
    count('firms', { createdAt: { greater_than: ago(7) } }),
    count('firms', {
      status: { equals: 'active' },
      'availability.date': { greater_than_equal: today },
    }),
    count('inquiries', { createdAt: { greater_than: ago(7) } }),
    count('inquiries', { createdAt: { greater_than: ago(30) } }),
    count('firms', {
      subscriptionStatus: { equals: 'trial' },
      trialEndsAt: { greater_than: new Date().toISOString(), less_than_equal: soon },
    }),
  ])
  return [
    { label: 'Nowe firmy (7 dni)', value: newFirms },
    { label: 'Aktywne terminy', value: activeDates },
    { label: 'Zapytania (7 dni)', value: inquiries7 },
    { label: 'Zapytania (30 dni)', value: inquiries30 },
    { label: 'Okres próbny kończy się w 7 dni', value: trialEnding },
  ]
}

/** Pulpit panelu (SPEC 3.12): kluczowe liczby i skrót do centrum moderacji. */
export async function Dashboard({ payload, user }: Props) {
  const moderator = isVerifiedStaff(user ?? null, 'admin', 'moderator')
  const admin = isVerifiedStaff(user ?? null, 'admin')
  if (!moderator) return null
  const [counts, stats] = await Promise.all([
    pendingCounts(payload),
    admin ? businessStats(payload) : Promise.resolve([]),
  ])
  const tiles = [
    { label: 'Profile do sprawdzenia', value: counts.firms, href: '/moderacja?k=firmy' },
    { label: 'Opinie do sprawdzenia', value: counts.reviews, href: '/moderacja?k=opinie' },
    { label: 'Otwarte zgłoszenia', value: counts.reports, href: '/moderacja?k=zgloszenia' },
    ...stats.map((stat) => ({ ...stat, href: null })),
  ]
  return (
    <section className="ent-dashboard" aria-label="Najważniejsze liczby">
      <ul>
        {tiles.map((tile) => (
          <li key={tile.label}>
            {tile.href ? (
              <Link href={tile.href}>
                <strong>{tile.value}</strong>
                <span>{tile.label}</span>
              </Link>
            ) : (
              <div>
                <strong>{tile.value}</strong>
                <span>{tile.label}</span>
              </div>
            )}
          </li>
        ))}
      </ul>
      <Link className="ent-dashboard__cta" href="/moderacja">
        Otwórz centrum moderacji
      </Link>
    </section>
  )
}
