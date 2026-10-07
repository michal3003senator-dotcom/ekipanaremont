import { FirmCard } from '@/components/features/firm/FirmCard'

import { DEMO_TODAY, FIRMS } from '../_data'

export default function TransitionListPage() {
  return (
    <div className="py-10 md:py-16">
      <h1 className="font-display text-h1 font-medium">Przejście karta → profil</h1>
      <p className="mt-3 max-w-prose text-small text-text-muted">
        Kliknij kartę: zdjęcie przechodzi w nagłówek profilu (View Transitions, 400 ms). Przy
        ograniczonym ruchu strona zmienia się od razu.
      </p>
      <ul className="mt-8 flex flex-col gap-4">
        {FIRMS.slice(0, 3).map((firm) => (
          <li key={firm.slug}>
            <FirmCard firm={firm} today={DEMO_TODAY} href={`/styleguide/przejscie/${firm.slug}`} />
          </li>
        ))}
      </ul>
    </div>
  )
}
