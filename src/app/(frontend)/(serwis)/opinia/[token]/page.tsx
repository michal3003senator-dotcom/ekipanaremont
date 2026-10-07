import { LinkIcon } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'

import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/States'
import { findReviewTarget } from '@/lib/reviews/token'
import { publicContext } from '@/lib/search/context'

import { ReviewForm } from './ReviewForm'

type Props = { params: Promise<{ token: string }> }

export const metadata: Metadata = {
  title: 'Wystaw opinię – Ekipa na Termin',
  robots: { index: false, follow: false },
}

/** Formularz opinii z jednorazowego linku w e-mailu (SPEC 3.7). */
export default async function ReviewPage({ params }: Props) {
  const { token } = await params
  const { payload } = await publicContext()
  const target = await findReviewTarget(payload, token)

  return (
    <div className="mx-auto flex max-w-prose flex-col gap-8 px-4 py-12 md:py-16">
      {target ? (
        <>
          <header className="flex flex-col gap-2">
            <p className="text-micro uppercase tracking-caps text-text-muted">Opinia o firmie</p>
            <h1 className="font-display text-h1 font-medium">{target.firm.name}</h1>
            <p className="text-body text-text-muted">
              Napisz, jak przebiegł kontakt albo prace. Publikujemy opinię po sprawdzeniu przez
              moderatora; firma może na nią odpowiedzieć.
            </p>
          </header>
          <ReviewForm
            token={token}
            firmName={target.firm.name}
            suggestedSignature={target.suggestedSignature}
          />
        </>
      ) : (
        <EmptyState
          icon={LinkIcon}
          title="Ten link już nie działa"
          description="Link do opinii działa 30 dni i tylko raz. Jeśli opinia została wysłana, czeka na sprawdzenie przez moderatora."
          action={
            <Button asChild variant="secondary">
              <Link href="/">Przechodzę na stronę główną</Link>
            </Button>
          }
        />
      )}
    </div>
  )
}
