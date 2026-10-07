import { Calculator as CalculatorIcon } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { EmptyState } from '@/components/ui/States'
import { calculatorsEnabled, listCalculators } from '@/lib/content/calculators'
import { publicContext } from '@/lib/search/context'

export const metadata: Metadata = {
  title: 'Kalkulatory remontowe – Ekipa na Termin',
  description:
    'Policz orientacyjny koszt remontu łazienki, ilość płytek, farby i gładzi. Potem znajdź firmę z wolnym terminem.',
  alternates: { canonical: '/kalkulatory' },
}

export default async function CalculatorsPage() {
  if (!(await calculatorsEnabled())) notFound()
  const { payload } = await publicContext()
  const items = await listCalculators(payload)

  return (
    <div className="mx-auto flex max-w-page flex-col gap-10 px-4 py-10 md:px-6 md:py-16">
      <header className="flex max-w-3xl flex-col gap-3">
        <h1 className="font-display text-h1 font-medium">Kalkulatory remontowe</h1>
        <p className="text-lead text-text-muted text-pretty">
          Orientacyjne koszty i ilości materiałów. Dokładną cenę poda firma po obejrzeniu
          pomieszczenia.
        </p>
      </header>
      {items.length === 0 ? (
        <EmptyState
          icon={CalculatorIcon}
          title="Kalkulatory w przygotowaniu"
          description="Wrócą tu wkrótce. Do tego czasu sprawdź firmy z wolnym terminem."
          action={
            <Link
              href="/szukaj"
              className="text-small font-medium text-accent-soft underline underline-offset-4"
            >
              Szukam firmy
            </Link>
          }
        />
      ) : (
        <ul className="grid gap-4 md:grid-cols-2">
          {items.map(({ doc, calculator }) => (
            <li key={doc.id}>
              <Link
                href={`/kalkulatory/${doc.slug}`}
                className="flex h-full flex-col gap-2 rounded-card border border-line bg-surface-1 p-6 inset-shadow-edge transition-colors duration-400 ease-standard hover:border-line-strong"
              >
                <h2 className="font-display text-h3 font-medium">{calculator!.title}</h2>
                {calculator!.intro && (
                  <p className="text-small text-text-muted">{calculator!.intro}</p>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
