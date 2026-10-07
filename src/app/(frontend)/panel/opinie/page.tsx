import { MessageSquare } from 'lucide-react'
import { redirect } from 'next/navigation'

import { Badge } from '@/components/ui/Badge'
import { Rating } from '@/components/ui/Rating'
import { EmptyState } from '@/components/ui/States'
import { formatInstantDate } from '@/lib/format/date'
import { getPanel } from '@/lib/panel/context'
import { isReplyEditable } from '@/lib/panel/profile'
import { getSettings } from '@/lib/settings'

import { PanelHeading } from '../_components/PanelSection'
import { ReplyForm } from './ReplyForm'

const STATUS = {
  pending: 'Czeka na moderację',
  approved: 'Opublikowana',
  rejected: 'Odrzucona',
} as const

export default async function ReviewsPage() {
  const { firm, payload, as } = await getPanel('/panel/opinie')
  if (!firm) redirect('/panel/profil/nowy')
  const { docs } = await payload.find({
    collection: 'reviews',
    where: { firm: { equals: firm.id } },
    sort: '-createdAt',
    limit: 50,
    depth: 0,
    ...as,
  })
  const delay = (await getSettings()).reviewDelayDays ?? 14

  return (
    <>
      <PanelHeading
        title="Opinie"
        lead="Opinie wystawiają klienci z linku po zapytaniu. Publikujemy je po sprawdzeniu przez moderatora."
      />
      {docs.length === 0 ? (
        <EmptyState
          icon={MessageSquare}
          title="Jeszcze nie ma opinii"
          description={`Klient dostaje prośbę o opinię ${delay} dni po zapytaniu wysłanym przez serwis.`}
        />
      ) : (
        <ul className="flex flex-col border-t border-line">
          {docs.map((review) => (
            <li key={review.id} className="flex flex-col gap-3 border-b border-line py-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <Rating value={review.rating} />
                <Badge
                  tone={
                    review.status === 'approved'
                      ? 'success'
                      : review.status === 'rejected'
                        ? 'danger'
                        : 'outline'
                  }
                >
                  {STATUS[review.status]}
                </Badge>
              </div>
              {review.title && <p className="font-medium">{review.title}</p>}
              <p className="text-body">{review.body}</p>
              <p className="text-small text-text-muted">
                {review.authorDisplayName} · {formatInstantDate(review.createdAt)}
              </p>
              {review.firmReply && (
                <div className="border-s-2 border-line-strong ps-4">
                  <p className="text-micro uppercase tracking-caps text-text-muted">
                    Odpowiedź firmy
                  </p>
                  <p className="text-body">{review.firmReply}</p>
                </div>
              )}
              {review.status === 'approved' && (
                <ReplyForm
                  id={review.id}
                  initial={review.firmReply}
                  editable={isReplyEditable(review.firmReplyAt)}
                />
              )}
            </li>
          ))}
        </ul>
      )}
    </>
  )
}
