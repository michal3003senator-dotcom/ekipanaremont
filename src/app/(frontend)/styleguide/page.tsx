import Link from 'next/link'

import { GROUPS } from './_data'

export default function StyleguidePage() {
  return (
    <div className="py-10 md:py-16">
      <h1 className="font-display text-display font-medium">Styleguide</h1>
      <p className="mt-3 max-w-prose text-lead text-text-muted">
        Komponenty Ekipy na Termin we wszystkich stanach, w kierunku B „Grafik” (ADR 0013).
        Przełącznik motywu jest w nagłówku.
      </p>
      <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {GROUPS.map((group) => (
          <li key={group.slug} className="flex">
            <Link
              href={`/styleguide/${group.slug}`}
              className="flex w-full flex-col gap-2 rounded-card border border-line bg-surface-1 p-6 transition-colors duration-400 ease-standard hover:border-line-strong"
            >
              <span className="font-display text-h3 font-medium">{group.title}</span>
              <span className="text-small text-text-muted">{group.description}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
