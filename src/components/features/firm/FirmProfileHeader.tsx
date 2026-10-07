import { Phone } from 'lucide-react'

import { AvailabilityStrip } from '@/components/features/availability-tiles/AvailabilityTiles'
import {
  availabilityDescription,
  availabilityLabel,
  confirmedLabel,
  getAvailability,
} from '@/components/features/availability-tiles/model'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import type { CalendarDate } from '@/lib/format/date'

import { firmArea, FirmFacts } from './FirmFacts'
import { FirmPhoto, firmPhotoTransition } from './FirmPhoto'
import type { FirmSummary } from './types'

type Props = { firm: FirmSummary; today: CalendarDate }

/**
 * Nagłówek profilu (ADR 0013): zdjęcie realizacji stoi na pasku kafli; termin i główna akcja
 * w panelu bocznym, na telefonie w pasku przyklejonym do dołu ekranu (SPEC 3.2, DESIGN §5).
 */
export function FirmProfileHeader({ firm, today }: Props) {
  const availability = getAvailability(today, firm.availableFrom)
  const confirmed =
    firm.confirmedOn && availability.status !== 'none'
      ? confirmedLabel(today, firm.confirmedOn)
      : null
  const initials = firm.name
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word.charAt(0))
    .join('')

  return (
    <div className="grid gap-x-6 gap-y-6 lg:grid-cols-12">
      <div className="lg:col-span-8">
        <div className="overflow-hidden rounded-card border border-line bg-surface-1 inset-shadow-edge">
          <FirmPhoto
            photo={firm.photo}
            sizes="(min-width: 1240px) 810px, (min-width: 1024px) 66vw, 100vw"
            transitionName={firmPhotoTransition(firm.slug)}
            eager
            className="aspect-video"
          />
          <div className="border-t border-line p-4 md:p-6">
            <AvailabilityStrip today={today} availability={availability} size="hero" />
          </div>
        </div>
        <div className="mt-6 flex items-start gap-4">
          <div
            aria-hidden="true"
            className="flex size-14 shrink-0 items-center justify-center rounded-control border border-line bg-surface-2 font-display text-h3 font-medium"
          >
            {initials}
          </div>
          <div className="flex flex-col gap-1">
            <h1 className="font-display text-h1 font-medium">{firm.name}</h1>
            <p className="text-body text-text-muted">
              {firm.services} · {firmArea(firm)}
            </p>
            <FirmFacts firm={firm} className="mt-1" />
          </div>
        </div>
      </div>

      <aside
        aria-label="Termin i kontakt"
        className="sticky-cta fixed inset-x-0 bottom-0 z-30 border-t border-line bg-surface-1 px-4 pt-3 lg:static lg:col-span-4 lg:self-start lg:rounded-card lg:border lg:p-6 lg:inset-shadow-edge"
      >
        <p className="sr-only">{availabilityDescription(today, availability, firm.confirmedOn)}</p>
        <div
          aria-hidden="true"
          className="flex items-baseline justify-between gap-3 lg:flex-col lg:items-start lg:gap-1"
        >
          <p className="hidden text-micro uppercase tracking-caps text-text-muted lg:block">
            Najbliższy wolny termin
          </p>
          <p className="font-display text-h3 font-medium">{availabilityLabel(availability)}</p>
          {confirmed && <p className="text-small text-text-muted">{confirmed}</p>}
        </div>
        <div className="mt-3 flex gap-3 lg:mt-6 lg:flex-col">
          <Button variant="primary" className="max-lg:flex-1 lg:w-full">
            Wyślij zapytanie
          </Button>
          <Button
            variant="secondary"
            size="icon"
            aria-label="Pokaż numer telefonu"
            className="lg:hidden"
          >
            <Icon icon={Phone} />
          </Button>
          <Button variant="secondary" className="hidden lg:inline-flex lg:w-full">
            <Icon icon={Phone} />
            Pokaż numer telefonu
          </Button>
        </div>
      </aside>
    </div>
  )
}
