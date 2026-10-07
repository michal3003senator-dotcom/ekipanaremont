import { CircleCheck } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { getFirmProfile } from '@/lib/firm/profile'
import { publicContext } from '@/lib/search/context'
import { getSettings } from '@/lib/settings'

type Props = { params: Promise<{ slug: string }> }

export const metadata: Metadata = {
  title: 'Zapytanie wysłane – Ekipa na Termin',
  robots: { index: false, follow: false },
}

/** Po wysłaniu zapytania (SPEC 3.6): ten sam czasownik co w przycisku, następny krok jasno. */
export default async function InquirySentPage({ params }: Props) {
  const { slug } = await params
  const { payload, today, expiryDays } = await publicContext()
  const [profile, settings] = await Promise.all([
    getFirmProfile(payload, slug, today, expiryDays),
    getSettings(),
  ])
  if (!profile) notFound()

  return (
    <div className="mx-auto flex max-w-prose flex-col gap-6 px-4 py-16 md:py-24">
      <Icon icon={CircleCheck} className="size-10 text-success" />
      <h1 className="font-display text-h1 font-medium">Zapytanie wysłane</h1>
      <p className="text-body">
        Firma {profile.summary.name} dostała Twoje zapytanie i odpowie telefonicznie albo e-mailem.
        Potwierdzenie wysłaliśmy na Twój adres e-mail.
      </p>
      <p className="text-body text-text-muted">
        Po {settings.reviewDelayDays ?? 14} dniach poprosimy Cię o opinię. Opinie publikujemy po
        sprawdzeniu przez moderatora.
      </p>
      <div className="flex flex-wrap gap-3">
        <Button asChild variant="primary">
          <Link href="/szukaj">Szukam kolejnej firmy</Link>
        </Button>
        <Button asChild variant="secondary">
          <Link href={`/firma/${profile.summary.slug}`}>Wracam do profilu</Link>
        </Button>
      </div>
    </div>
  )
}
