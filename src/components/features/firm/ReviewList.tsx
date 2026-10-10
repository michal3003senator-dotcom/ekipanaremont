import { ReportButton } from '@/components/features/report/ReportButton'
import { Rating } from '@/components/ui/Rating'
import { formatInstantDate } from '@/lib/format/date'
import { formatCount, formatRating } from '@/lib/format/number'
import type { ProfileReview } from '@/lib/firm/profile'

type Distribution = ReadonlyArray<{ stars: number; count: number }>

/** Średnia i rozkład ocen 5…1 (SPEC 3.2): paski w kolorze tekstu, liczby w kroju danych. */
export function RatingSummary({
  average,
  distribution,
}: {
  average: number
  distribution: Distribution
}) {
  const total = distribution.reduce((sum, row) => sum + row.count, 0)
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-10">
      <div className="flex flex-col gap-1">
        <p className="font-display text-display font-medium leading-none">
          {formatRating(average)}
        </p>
        <Rating value={average} starsOnly />
        <p className="text-small text-text-muted">
          {formatCount(total, { one: 'opinia', few: 'opinie', many: 'opinii' })}
        </p>
      </div>
      <dl className="flex flex-1 flex-col gap-2">
        {distribution.map((row) => (
          <div key={row.stars} className="flex items-center gap-3 text-small">
            <dt className="w-16 shrink-0 font-data">{row.stars} / 5</dt>
            <dd className="flex flex-1 items-center gap-3">
              <span
                aria-hidden="true"
                className="h-2 flex-1 overflow-hidden rounded-full bg-surface-2"
              >
                <span
                  className="block h-full rounded-full bg-text"
                  style={{ width: `${total ? (row.count / total) * 100 : 0}%` }}
                />
              </span>
              <span className="w-8 text-end font-data text-text-muted">{row.count}</span>
            </dd>
          </div>
        ))}
      </dl>
    </div>
  )
}

/** Opublikowane opinie z odpowiedzią firmy. */
export function ReviewList({
  reviews,
  nonce,
}: {
  reviews: readonly ProfileReview[]
  nonce?: string
}) {
  return (
    <ul className="flex flex-col border-t border-line">
      {reviews.map((review) => (
        <li
          key={review.id}
          className="flex flex-col gap-3 border-b border-line py-6 last:border-b-0 last:pb-0"
        >
          <Rating value={review.rating} />
          {review.title && <p className="font-medium">{review.title}</p>}
          <p className="max-w-prose text-body">{review.body}</p>
          <p className="text-small text-text-muted">
            {review.authorDisplayName}
            {review.publishedAt && ` · ${formatInstantDate(review.publishedAt)}`}
          </p>
          {review.firmReply && (
            <div className="max-w-prose border-s-2 border-line-strong ps-4">
              <p className="text-micro uppercase tracking-caps text-text-muted">Odpowiedź firmy</p>
              <p className="text-body">{review.firmReply}</p>
            </div>
          )}
          <ReportButton targetType="reviews" targetId={review.id} label="opinię" nonce={nonce} />
        </li>
      ))}
    </ul>
  )
}
