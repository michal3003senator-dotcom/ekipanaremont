import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import type { ReactNode } from 'react'

import { isProductionDeployment } from '@/lib/runtime'

import { fontVariables } from './_fonts'
import './lab.css'

export const metadata: Metadata = {
  title: 'Design lab – Ekipa na Termin',
  robots: { index: false, follow: false },
}

/** Porównanie kierunków wizualnych (faza 2a). Na produkcji trasa nie istnieje. */
export default function DesignLabLayout({ children }: { children: ReactNode }) {
  if (isProductionDeployment()) notFound()
  return <div className={fontVariables}>{children}</div>
}
