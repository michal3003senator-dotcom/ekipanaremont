import type { Metadata } from 'next'

import { AccountScreen } from '../../_components/AccountScreen'
import { ResetForm } from './ResetForm'

export const metadata: Metadata = { title: 'Nowe hasło – Ekipa na Termin', referrer: 'no-referrer' }

export default async function ResetPasswordPage({
  params,
}: {
  params: Promise<{ token: string }>
}) {
  const { token } = await params
  return (
    <AccountScreen
      title="Nowe hasło"
      lead="Po zapisaniu zalogujesz się nowym hasłem na każdym urządzeniu."
      aside={false}
    >
      <ResetForm token={token} />
    </AccountScreen>
  )
}
