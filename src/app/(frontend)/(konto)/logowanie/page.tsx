import type { Metadata } from 'next'
import { redirect } from 'next/navigation'

import { getFirmSession } from '@/lib/auth/session'

import { AccountScreen } from '../_components/AccountScreen'
import { LoginForm } from './LoginForm'

export const metadata: Metadata = { title: 'Logowanie firmy – Ekipa na Termin' }

const NOTICES: Record<string, string> = {
  zmienione: 'Hasło zmienione. Zaloguj się nowym hasłem.',
  potwierdzony: 'Adres potwierdzony. Zaloguj się, żeby uzupełnić profil firmy.',
}

type Props = { searchParams: Promise<{ next?: string; haslo?: string; adres?: string }> }

export default async function LoginPage({ searchParams }: Props) {
  if (await getFirmSession()) redirect('/panel')
  const params = await searchParams
  const notice = NOTICES[params.haslo ?? ''] ?? NOTICES[params.adres ?? '']
  return (
    <AccountScreen
      title="Zaloguj się do panelu firmy"
      lead="Termin, zapytania i realizacje w jednym miejscu – także na telefonie."
    >
      <LoginForm next={typeof params.next === 'string' ? params.next : undefined} notice={notice} />
    </AccountScreen>
  )
}
