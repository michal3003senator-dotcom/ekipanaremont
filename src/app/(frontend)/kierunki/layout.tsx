import type { Metadata } from 'next'
import { Archivo } from 'next/font/google'
import { notFound } from 'next/navigation'
import type { ReactNode } from 'react'

import { isProductionDeployment } from '@/lib/runtime'

// Kroje prób kierunku – tylko na tej trasie. next/font wymaga literałów w opcjach.
const archivo = Archivo({
  subsets: ['latin', 'latin-ext'],
  axes: ['wdth'],
  variable: '--font-archivo',
})

export const metadata: Metadata = {
  title: 'Kierunki – Ekipa na Termin',
  robots: { index: false, follow: false },
}

/** Próby radykalnie innych kierunków wizualnych (poza DESIGN.md, za zgodą właściciela). Poza produkcją. */
export default function DirectionsLayout({ children }: { children: ReactNode }) {
  if (isProductionDeployment()) notFound()
  return <div className={archivo.variable}>{children}</div>
}
