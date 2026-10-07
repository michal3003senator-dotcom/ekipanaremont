import { Star } from 'lucide-react'

import { cn } from '@/lib/cn'
import { formatCount, formatRating } from '@/lib/format/number'

import { Icon } from './Icon'

type Props = {
  value: number
  count?: number
  className?: string
}

/** Ocena: gwiazdki (dekoracja) i liczby w kroju danych, np. „4,9 · 37 opinii”. */
export function Rating({ value, count, className }: Props) {
  const label =
    `Ocena ${formatRating(value)} na 5` +
    (count === undefined
      ? ''
      : `, ${formatCount(count, { one: 'opinia', few: 'opinie', many: 'opinii' })}`)

  return (
    <p className={cn('inline-flex items-center gap-2 text-small', className)}>
      <span className="sr-only">{label}</span>
      <span aria-hidden="true" className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <Icon
            key={star}
            icon={Star}
            className={cn(
              'size-4',
              value >= star - 0.25 ? 'fill-text text-text' : 'text-line-strong',
            )}
          />
        ))}
      </span>
      <span aria-hidden="true" className="font-data">
        <span className="font-medium">{formatRating(value)}</span>
        {count !== undefined && <span className="text-text-muted"> · {count}</span>}
      </span>
    </p>
  )
}
