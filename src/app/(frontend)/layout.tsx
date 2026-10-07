import type { Metadata, Viewport } from 'next'
import { cookies } from 'next/headers'
import type { ReactNode } from 'react'

import { Toaster } from '@/components/ui/Toast'
import { readTheme, THEME_COOKIE, themeAttribute, themeColor } from '@/lib/theme'

import { fontVariables } from './fonts'
import './globals.css'

export const metadata: Metadata = {
  title: 'Ekipa na Termin',
  description: 'Firmy remontowe z województwa łódzkiego z najbliższym wolnym terminem.',
}

async function currentTheme() {
  return readTheme((await cookies()).get(THEME_COOKIE)?.value)
}

export async function generateViewport(): Promise<Viewport> {
  return { themeColor: themeColor(await currentTheme()), viewportFit: 'cover' }
}

export default async function RootLayout({ children }: { children: ReactNode }) {
  // Ciasteczka wymuszają renderowanie przy każdym żądaniu – tego i tak wymaga CSP z nonce (ADR 0009).
  const theme = await currentTheme()

  return (
    <html lang="pl" data-theme={themeAttribute(theme)} className={fontVariables}>
      <body className="bg-bg font-sans text-text">
        {children}
        <Toaster />
      </body>
    </html>
  )
}
