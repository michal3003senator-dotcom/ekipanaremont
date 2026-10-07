import { Rating } from '@/components/ui/Rating'
import { cn } from '@/lib/cn'
import { formatCount } from '@/lib/format/number'

import type { FirmSummary } from './types'

export const firmArea = (firm: FirmSummary) =>
  firm.areaExtra > 0
    ? `${firm.locality} + ${formatCount(firm.areaExtra, { one: 'miejscowość', few: 'miejscowości', many: 'miejscowości' })}`
    : firm.locality

/** Ocena z liczbą opinii i źródło weryfikacji – mówi dokładnie, co sprawdziliśmy. */
export function FirmFacts({ firm, className }: { firm: FirmSummary; className?: string }) {
  return (
    <div
      className={cn(
        'flex flex-wrap items-center gap-x-3 gap-y-1 text-small text-text-muted',
        className,
      )}
    >
      {firm.rating === null ? (
        <span>Bez opinii</span>
      ) : (
        <Rating value={firm.rating} count={firm.reviews} />
      )}
      {firm.registry && (
        <span>
          {firm.registry === 'VAT' ? 'Na Białej liście VAT' : `W rejestrze ${firm.registry}`}
        </span>
      )}
    </div>
  )
}
