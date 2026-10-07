import type { CalendarDate } from '@/lib/format/date'

import { FIRMS } from '../_data'
import { SentenceSearch } from './SentenceSearch'

const firmTerms = FIRMS.map(({ availableFrom, offers, serves }) => ({
  availableFrom,
  offers,
  serves,
}))

/** C „Zdanie”: wyszukiwarka i odpowiedź w jednym zdaniu, szeroki krój. */
export function HeroC({ today }: { today: CalendarDate }) {
  return (
    <section className="mx-auto max-w-page px-4 pb-14 pt-8 md:px-6 md:pb-24 md:pt-12">
      <h1 className="text-lead font-semibold">
        Ekipy remontowe z wolnym terminem{' '}
        <span className="text-text-muted">· województwo łódzkie</span>
      </h1>
      <div className="mt-6 border-t border-line pt-8 md:pt-12">
        <SentenceSearch today={today} firms={firmTerms} />
      </div>
    </section>
  )
}
