import type { Metadata } from 'next'
import { headers } from 'next/headers'

import { AccountScreen } from '../_components/AccountScreen'
import { ForgotForm } from './ForgotForm'

export const metadata: Metadata = { title: 'Nowe hasło – Ekipa na Termin' }

export default async function ForgotPasswordPage() {
  const nonce = (await headers()).get('x-nonce') ?? undefined
  return (
    <AccountScreen
      title="Ustaw nowe hasło"
      lead="Podaj e-mail konta. Wyślemy link do zmiany hasła, ważny godzinę."
      aside={false}
    >
      <ForgotForm siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY} nonce={nonce} />
    </AccountScreen>
  )
}
