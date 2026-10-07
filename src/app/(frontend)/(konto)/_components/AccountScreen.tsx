import type { ReactNode } from 'react'

import { AvailabilityTiles } from '@/components/features/availability-tiles/AvailabilityTiles'
import { getAvailability } from '@/components/features/availability-tiles/model'
import { addDays, todayInWarsaw } from '@/lib/format/date'

type Props = { title: string; lead?: ReactNode; children: ReactNode; aside?: boolean }

const FACTS = [
  { term: '30 dni', detail: 'bez opłat od zatwierdzenia profilu' },
  { term: 'NIP', detail: 'sprawdzamy w CEIDG, KRS i na Białej liście VAT' },
  { term: '1 dotknięcie', detail: 'tyle trwa potwierdzenie terminu w panelu' },
] as const

/**
 * Ekran konta: formularz w jednej kolumnie, obok (od 1024 px) przykład kafla terminu –
 * to, co firma zyska po rejestracji, pokazane, a nie opisane.
 */
export function AccountScreen({ title, lead, children, aside = true }: Props) {
  const today = todayInWarsaw()
  const sample = getAvailability(today, addDays(today, 6))

  return (
    <div className="mx-auto grid w-full max-w-page flex-1 lg:grid-cols-12">
      <section className="flex flex-col justify-center gap-8 px-4 py-14 md:px-6 lg:col-span-6 lg:py-24 lg:pe-16">
        <div className="flex max-w-md flex-col gap-3">
          <h1 className="font-display text-h2 font-medium text-balance">{title}</h1>
          {lead && <p className="text-body text-text-muted text-pretty">{lead}</p>}
        </div>
        <div className="w-full max-w-md">{children}</div>
      </section>
      {aside && (
        <aside
          aria-label="Jak wygląda termin w serwisie"
          className="flex flex-col justify-center gap-10 border-line px-4 py-14 max-lg:border-t md:px-6 lg:col-span-6 lg:border-s lg:py-24 lg:ps-16"
        >
          <div className="flex flex-col gap-4">
            <p className="text-micro font-medium uppercase tracking-caps text-text-muted">
              Tak klienci zobaczą Twój termin
            </p>
            <AvailabilityTiles
              today={today}
              availability={sample}
              confirmedOn={today}
              size="hero"
            />
            <p className="text-small text-text-muted">
              Przykład. Klienci widzą tylko terminy potwierdzone przez firmę.
            </p>
          </div>
          <dl className="grid border-t border-line">
            {FACTS.map((fact) => (
              <div key={fact.term} className="flex items-baseline gap-4 border-b border-line py-4">
                <dt className="w-28 shrink-0 font-data text-body font-medium tabular-nums">
                  {fact.term}
                </dt>
                <dd className="text-small text-text-muted">{fact.detail}</dd>
              </div>
            ))}
          </dl>
        </aside>
      )}
    </div>
  )
}
