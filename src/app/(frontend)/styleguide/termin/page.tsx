import {
  AvailabilityTiles,
  type TileSize,
} from '@/components/features/availability-tiles/AvailabilityTiles'
import { getAvailability } from '@/components/features/availability-tiles/model'
import { FirmBoard } from '@/components/features/firm/FirmBoard'
import { FirmCard } from '@/components/features/firm/FirmCard'
import { Badge } from '@/components/ui/Badge'
import { Rating } from '@/components/ui/Rating'
import type { CalendarDate } from '@/lib/format/date'

import { Section, State } from '../_components/Section'
import { DEMO_TODAY, FIRMS } from '../_data'

const STATES: Array<{
  title: string
  availableFrom: CalendarDate | null
  confirmedOn?: CalendarDate
}> = [
  { title: 'Termin w ciągu 14 dni', availableFrom: '2026-10-14', confirmedOn: '2026-10-06' },
  { title: 'Wolny od dziś', availableFrom: '2026-10-07', confirmedOn: '2026-10-07' },
  { title: 'Termin dalej niż 14 dni', availableFrom: '2026-11-03', confirmedOn: '2026-10-04' },
  { title: 'Brak potwierdzonego terminu', availableFrom: null },
]

const SIZES: Array<{ size: TileSize; label: string }> = [
  { size: 'card', label: 'Karta' },
  { size: 'profile', label: 'Profil i panel' },
  { size: 'hero', label: 'Nagłówek profilu' },
]

export default function AvailabilityPage() {
  return (
    <>
      <h1 className="pt-10 font-display text-h1 font-medium md:pt-16">Termin i firmy</h1>

      <Section
        title="Kafel terminu"
        description="14 dni od dziś, szersza fuga między tygodniami. Kafle zapalają się raz po wejściu w ekran; przy ograniczonym ruchu od razu widać stan końcowy."
      >
        {SIZES.map(({ size, label }) => (
          <State key={size} label={label}>
            <div className="grid gap-4 md:grid-cols-2">
              {STATES.map((state) => (
                <div
                  key={state.title}
                  className="rounded-card border border-line bg-surface-1 p-4 inset-shadow-edge md:p-6"
                >
                  <p className="mb-4 text-small text-text-muted">{state.title}</p>
                  <AvailabilityTiles
                    today={DEMO_TODAY}
                    availability={getAvailability(DEMO_TODAY, state.availableFrom)}
                    confirmedOn={state.confirmedOn}
                    size={size}
                  />
                </div>
              ))}
            </div>
          </State>
        ))}
      </Section>

      <Section
        title="Karta firmy"
        description="Cała karta jest linkiem. Od 768 px paski kafli kolejnych kart stoją w jednej kolumnie; najbliższy termin najpierw, firmy bez terminu na końcu."
      >
        <ul className="flex flex-col gap-4">
          {FIRMS.map((firm) => (
            <li key={firm.slug}>
              <FirmCard firm={firm} today={DEMO_TODAY} />
            </li>
          ))}
        </ul>
      </Section>

      <Section
        title="Grafik"
        description="Firmy na wspólnej osi dni (wyniki i strona główna). Miniatury to zdjęcia poglądowe."
      >
        <FirmBoard firms={FIRMS.slice(0, 3)} today={DEMO_TODAY} />
      </Section>

      <Section title="Ocena i znaczniki" className="md:grid-cols-2">
        <State label="Ocena">
          <div className="flex flex-col gap-2">
            <Rating value={4.9} count={37} />
            <Rating value={5} count={8} />
            <Rating value={3.5} count={2} />
          </div>
        </State>
        <State label="Znaczniki">
          <div className="flex flex-wrap gap-2">
            <Badge>Faktura VAT</Badge>
            <Badge>Gwarancja 24 mies.</Badge>
            <Badge tone="outline">W rejestrze CEIDG</Badge>
            <Badge tone="success">Termin potwierdzony</Badge>
            <Badge tone="danger">Termin wygasł</Badge>
          </div>
        </State>
      </Section>
    </>
  )
}
