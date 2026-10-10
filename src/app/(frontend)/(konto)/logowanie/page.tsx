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

const BANNED =
  'Konto jest zablokowane. Uzasadnienie i link do odwołania wysłaliśmy e-mailem. Po zakończeniu blokady panel znowu będzie dostępny. Kopię danych lub ich usunięcie załatwisz przez stronę Kontakt.'

type Props = {
  searchParams: Promise<{ next?: string; haslo?: string; adres?: string; blokada?: string }>
}

export default async function LoginPage({ searchParams }: Props) {
  const params = await searchParams
  // Zablokowane konto wraca tutaj z panelu – bez przekierowania z powrotem (pętla).
  const banned = params.blokada === '1'
  if (!banned && (await getFirmSession())) redirect('/panel')
  const notice = banned ? BANNED : (NOTICES[params.haslo ?? ''] ?? NOTICES[params.adres ?? ''])
  return (
    <AccountScreen
      title="Zaloguj się do panelu firmy"
      lead="Termin, zapytania i realizacje w jednym miejscu – także na telefonie."
    >
      <LoginForm next={typeof params.next === 'string' ? params.next : undefined} notice={notice} />
    </AccountScreen>
  )
}
