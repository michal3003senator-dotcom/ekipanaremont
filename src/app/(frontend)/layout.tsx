import type { Metadata } from 'next'
import { connection } from 'next/server'
import type { ReactNode } from 'react'

export const metadata: Metadata = {
  title: 'Ekipa na Termin',
  description: 'Firmy remontowe z województwa łódzkiego z najbliższym wolnym terminem.',
}

export default async function RootLayout({ children }: { children: ReactNode }) {
  // CSP z nonce wymaga renderowania przy każdym żądaniu (ADR 0009).
  await connection()

  return (
    <html lang="pl">
      <body>{children}</body>
    </html>
  )
}
