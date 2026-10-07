import type { Metadata } from 'next'
import Link from 'next/link'

import { FormNotice } from '@/components/features/auth/FormNotice'
import { Button } from '@/components/ui/Button'
import { verifyEmailToken } from '@/lib/auth/verify-email'

import { AccountScreen } from '../../_components/AccountScreen'

export const metadata: Metadata = {
  title: 'Potwierdzenie adresu – Ekipa na Termin',
  referrer: 'no-referrer',
}

const COPY = {
  verified: {
    title: 'Adres potwierdzony',
    text: 'Zaloguj się i przejdź do profilu firmy. Zaczniemy od numeru NIP.',
  },
  expired: {
    title: 'Link wygasł',
    text: 'Link działa 24 godziny. Zaloguj się – wyślemy nowy jednym kliknięciem.',
  },
  invalid: {
    title: 'Link nie działa',
    text: 'Ten link jest nieprawidłowy albo został już użyty. Jeśli adres jest potwierdzony, po prostu się zaloguj.',
  },
} as const

export default async function VerifyEmailPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  const status = await verifyEmailToken(token)
  const copy = COPY[status]
  return (
    <AccountScreen title={copy.title} aside={status === 'verified'}>
      <div className="flex flex-col gap-6">
        <FormNotice tone={status === 'verified' ? 'success' : 'error'}>{copy.text}</FormNotice>
        <Button asChild variant="primary" className="self-start">
          <Link
            href={
              status === 'verified' ? '/logowanie?adres=potwierdzony&next=/panel' : '/logowanie'
            }
          >
            Przechodzę do logowania
          </Link>
        </Button>
      </div>
    </AccountScreen>
  )
}
