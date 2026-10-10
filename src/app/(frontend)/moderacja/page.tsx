import config from '@payload-config'
import { CheckCheck, ShieldCheck } from 'lucide-react'
import Link from 'next/link'
import { getPayload } from 'payload'

import { ModerationCard } from '@/components/features/moderation/ModerationCard'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { EmptyState } from '@/components/ui/States'
import { cn } from '@/lib/cn'
import { getModerator } from '@/lib/auth/session'
import { QUEUE_TABS, type QueueTab } from '@/lib/moderation/options'
import { loadQueue, pendingCounts } from '@/lib/moderation/queue'
import { getSettings } from '@/lib/settings'

type Props = { searchParams: Promise<{ k?: string; s?: string; q?: string }> }

const TABS = Object.keys(QUEUE_TABS) as QueueTab[]
const isTab = (value: unknown): value is QueueTab => TABS.includes(value as QueueTab)

/**
 * Centrum moderacji (SPEC 3.11): kolejka z zakładkami i licznikami. Bez wybranej zakładki otwiera
 * pierwszą z oczekującymi – zatwierdzenie profilu to jedno dotknięcie od otwarcia aplikacji.
 */
export default async function ModerationPage({ searchParams }: Props) {
  const moderator = await getModerator()
  if (!moderator)
    return (
      <EmptyState
        icon={ShieldCheck}
        title="Zaloguj się do panelu"
        description="Centrum moderacji jest dla moderatorów i administratorów po kodzie 2FA. Zaloguj się w panelu i wróć tutaj."
        action={
          <Button asChild variant="primary">
            <Link href="/admin/login?redirect=%2Fmoderacja">Loguję się</Link>
          </Button>
        }
      />
    )

  const payload = await getPayload({ config })
  const counts = await pendingCounts(payload)
  const waiting: Record<QueueTab, number> = {
    firmy: counts.firms,
    opinie: counts.reviews,
    zgloszenia: counts.reports,
  }
  const { k, s, q } = await searchParams
  const query = typeof q === 'string' ? q.slice(0, 80) : ''
  const tab = isTab(k) ? k : (TABS.find((name) => waiting[name] > 0) ?? 'firmy')
  const page = Math.max(1, Math.min(Number.parseInt(s ?? '1', 10) || 1, 500))
  const [queue, settings] = await Promise.all([loadQueue(payload, tab, page, query), getSettings()])
  const templates = (settings.moderationReasonTemplates ?? []).map(({ label, text }) => ({
    label,
    text,
  }))

  return (
    <>
      <nav aria-label="Kolejki" className="grid grid-cols-3 gap-2">
        {TABS.map((name) => (
          <Link
            key={name}
            href={`/moderacja?k=${name}`}
            aria-current={name === tab ? 'page' : undefined}
            className={cn(
              'state-layer flex h-12 items-center justify-center gap-2 rounded-pill border text-small font-semibold',
              name === tab
                ? 'border-transparent bg-accent-container text-on-accent-container'
                : 'border-line text-text-muted',
            )}
          >
            {QUEUE_TABS[name]}
            <span className="tabular-nums">{waiting[name]}</span>
          </Link>
        ))}
      </nav>

      <form role="search" action="/moderacja" className="flex gap-2">
        <input type="hidden" name="k" value={tab} />
        <Input
          name="q"
          type="search"
          defaultValue={query}
          aria-label={tab === 'firmy' ? 'Szukaj po nazwie lub NIP' : 'Szukaj w kolejce'}
          placeholder={tab === 'firmy' ? 'Nazwa lub NIP' : 'Szukaj w kolejce'}
        />
        <Button type="submit" variant="secondary">
          Szukaj
        </Button>
      </form>

      {queue.items.length === 0 ? (
        <EmptyState
          icon={CheckCheck}
          title="Pusto"
          description="Wszystko w tej kolejce jest rozpatrzone. Nowe elementy pojawią się tutaj, a codzienne podsumowanie przyjdzie e-mailem."
        />
      ) : (
        queue.items.map((item) => (
          <ModerationCard key={item.id} item={item} templates={templates} />
        ))
      )}

      {queue.totalPages > 1 && (
        <nav aria-label="Strony kolejki" className="flex justify-between gap-2">
          {page > 1 ? (
            <Button asChild variant="secondary">
              <Link href={`/moderacja?k=${tab}&s=${page - 1}&q=${encodeURIComponent(query)}`}>
                Poprzednie
              </Link>
            </Button>
          ) : (
            <span />
          )}
          {page < queue.totalPages && (
            <Button asChild variant="secondary">
              <Link href={`/moderacja?k=${tab}&s=${page + 1}&q=${encodeURIComponent(query)}`}>
                Następne
              </Link>
            </Button>
          )}
        </nav>
      )}
    </>
  )
}
