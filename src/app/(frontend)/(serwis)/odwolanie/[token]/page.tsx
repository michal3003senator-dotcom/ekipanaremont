import config from '@payload-config'
import { Clock } from 'lucide-react'
import type { Metadata } from 'next'
import { headers } from 'next/headers'
import { getPayload } from 'payload'

import { EmptyState } from '@/components/ui/States'
import { formatInstantDate } from '@/lib/format/date'
import { appealSubject } from '@/lib/moderation/decisions'
import { REPORT_DECISIONS, type ReportDecision } from '@/lib/moderation/options'

import { AppealForm } from './AppealForm'

export const metadata: Metadata = {
  title: 'Odwołanie od decyzji – Ekipa na Termin',
  robots: { index: false, follow: false },
}

type Props = { params: Promise<{ token: string }> }

/** Odwołanie od decyzji moderatora (SPEC 3.11, art. 20 DSA) – wejście tylko z linku w e-mailu. */
export default async function AppealPage({ params }: Props) {
  const { token } = await params
  const reportId = appealSubject(decodeURIComponent(token).slice(0, 1000))
  const payload = await getPayload({ config })
  const decision = reportId
    ? await payload.findByID({
        collection: 'reports',
        id: reportId,
        depth: 0,
        overrideAccess: true,
        disableErrors: true,
      })
    : null

  if (!decision)
    return (
      <div className="mx-auto max-w-xl px-4 py-16">
        <EmptyState
          icon={Clock}
          title="Link wygasł"
          description="Na odwołanie jest 6 miesięcy od decyzji. Jeśli to pomyłka, napisz do nas przez stronę Kontakt."
        />
      </div>
    )

  const nonce = (await headers()).get('x-nonce') ?? undefined
  return (
    <div className="mx-auto flex max-w-xl flex-col gap-8 px-4 py-10 md:py-16">
      <header className="flex flex-col gap-2">
        <h1 className="font-display text-h1 font-medium">Odwołanie od decyzji</h1>
        <p className="text-body text-text-muted">
          Rozpatrzy je inny moderator niż ten, który podjął decyzję.
        </p>
      </header>
      <dl className="grid gap-x-6 gap-y-2 rounded-card border border-line bg-surface-1 p-4 text-body">
        <dt className="text-text-muted">Dotyczy</dt>
        <dd>{decision.targetTitle ?? 'treść w serwisie'}</dd>
        <dt className="text-text-muted">Decyzja</dt>
        <dd>
          {REPORT_DECISIONS[(decision.decision ?? 'none') as ReportDecision]}
          {decision.decidedAt && `, ${formatInstantDate(decision.decidedAt)}`}
        </dd>
        <dt className="text-text-muted">Uzasadnienie</dt>
        <dd className="whitespace-pre-line">{decision.statementOfReasons ?? '–'}</dd>
      </dl>
      <AppealForm token={token} nonce={nonce} />
    </div>
  )
}
