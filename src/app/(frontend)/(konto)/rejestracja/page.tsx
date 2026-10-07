import type { Metadata } from 'next'
import { headers } from 'next/headers'

import { AccountScreen } from '../_components/AccountScreen'
import { RegisterForm } from './RegisterForm'

export const metadata: Metadata = { title: 'Załóż konto firmy – Ekipa na Termin' }

export default async function RegisterPage() {
  const nonce = (await headers()).get('x-nonce') ?? undefined
  return (
    <AccountScreen
      title="Załóż konto firmy"
      lead="Profil z najbliższym wolnym terminem. Po rejestracji sprawdzimy NIP i przeprowadzimy Cię przez uzupełnienie profilu."
    >
      <RegisterForm siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY} nonce={nonce} />
    </AccountScreen>
  )
}
