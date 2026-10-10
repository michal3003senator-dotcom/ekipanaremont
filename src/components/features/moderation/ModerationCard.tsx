import { Badge } from '@/components/ui/Badge'
import type { QueueItem } from '@/lib/moderation/queue'

import { DecisionBar, type DecisionOption, type ReasonTemplate } from './DecisionBar'
import { SanctionForm } from './SanctionForm'

const OPTIONS: Record<'firm' | 'review' | 'report' | 'appeal', DecisionOption[]> = {
  firm: [
    { decision: 'approve', label: 'Zatwierdzam', variant: 'primary', needsReason: false },
    {
      decision: 'reject',
      label: 'Do poprawy',
      confirm: 'Odsyłam do poprawy',
      variant: 'secondary',
      needsReason: true,
    },
  ],
  review: [
    { decision: 'approve', label: 'Publikuję', variant: 'primary', needsReason: false },
    { decision: 'reject', label: 'Odrzucam', variant: 'secondary', needsReason: true },
  ],
  report: [
    { decision: 'hidden', label: 'Ukrywam treść', variant: 'danger', needsReason: true },
    {
      decision: 'dismiss',
      label: 'Bez zmian',
      confirm: 'Odrzucam zgłoszenie',
      variant: 'secondary',
      needsReason: true,
    },
  ],
  appeal: [
    {
      decision: 'revert',
      label: 'Uchylam decyzję',
      variant: 'tonal',
      needsReason: true,
    },
    {
      decision: 'dismiss',
      label: 'Utrzymuję',
      confirm: 'Utrzymuję decyzję',
      variant: 'secondary',
      needsReason: true,
    },
  ],
}

type Props = { item: QueueItem; templates: ReasonTemplate[] }

/** Karta w kolejce (SPEC 3.11): podgląd, kontekst (historia, konta) i szybkie akcje. */
export function ModerationCard({ item, templates }: Props) {
  const options = OPTIONS[item.appeal ? 'appeal' : item.kind]
  const headingId = `karta-${item.id}`

  return (
    <article
      aria-labelledby={headingId}
      className="flex flex-col gap-4 rounded-card border border-line bg-surface-1 p-4 shadow-e1 md:p-6"
    >
      <header className="flex flex-col gap-1">
        <div className="flex flex-wrap items-center gap-2">
          {item.appeal && <Badge tone="outline">Odwołanie</Badge>}
          {item.history > 0 && <Badge tone="danger">Wcześniejsze decyzje: {item.history}</Badge>}
        </div>
        <h2 id={headingId} className="font-display text-lead">
          {item.title}
        </h2>
        <p className="text-small text-text-muted">{item.subtitle}</p>
      </header>

      {item.body && (
        <p className="max-h-60 overflow-y-auto whitespace-pre-line rounded-control bg-surface-2 p-3 text-body">
          {item.body}
        </p>
      )}

      {item.facts.length > 0 && (
        <dl className="grid gap-x-4 gap-y-2 text-small">
          {item.facts.map((fact) => (
            <div key={fact.label} className="flex flex-col">
              <dt className="text-text-muted">{fact.label}</dt>
              <dd className="whitespace-pre-line break-words">{fact.value}</dd>
            </div>
          ))}
        </dl>
      )}

      {(item.links.length > 0 || item.accounts.some((account) => account.sanctions > 0)) && (
        <ul className="flex flex-wrap gap-x-4 gap-y-2 text-small">
          {item.links.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                target="_blank"
                rel="noreferrer"
                className="underline underline-offset-4"
              >
                {link.label}
              </a>
            </li>
          ))}
          {item.accounts
            .filter((account) => account.sanctions > 0)
            .map((account) => (
              <li key={account.id} className="text-danger">
                {account.label}: sankcje {account.sanctions}
              </li>
            ))}
        </ul>
      )}

      <DecisionBar kind={item.kind} id={item.id} options={options} templates={templates} />
      {item.kind !== 'review' && (
        <SanctionForm
          accounts={item.accounts}
          reportId={item.kind === 'report' ? item.id : undefined}
          templates={templates}
        />
      )}
    </article>
  )
}
