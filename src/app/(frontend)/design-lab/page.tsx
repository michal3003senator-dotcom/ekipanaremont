import Link from 'next/link'

import { DEMO_TODAY, VARIANTS, type VariantKey } from './_data'
import { LabShell, themeFromParam } from './_components/LabShell'
import { TileStatesSection } from './_components/LabSections'

const DESCRIPTIONS: Record<VariantKey, string> = {
  a: 'Realizacja firmy stoi na pasku kafli, obok wyszukiwarka. Spokojna, redakcyjna typografia.',
  b: 'Firmy na wspólnych kolumnach dni, jak grafik na budowie. Wąski krój techniczny.',
  c: 'Wyszukiwarka zapisana jako jedno zdanie, odpowiedź pojawia się od razu. Szeroki krój.',
}

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> }

export default async function DesignLabPage({ searchParams }: Props) {
  const theme = themeFromParam((await searchParams).motyw)
  const query = theme === 'light' ? '?motyw=jasny' : ''

  return (
    <LabShell set="a" theme={theme}>
      <main>
        <div className="mx-auto max-w-page px-4 pb-14 pt-10 md:px-6 md:pb-24 md:pt-16">
          <h1 className="font-display text-h1 font-semibold">Design lab</h1>
          <p className="mt-3 max-w-prose text-lead text-text-muted">
            Trzy kierunki na tych samych treściach. Firmy są zmyślone, zdjęcia poglądowe, a data
            zatrzymana na 7 października 2026.
          </p>
          <ul className="mt-10 grid gap-6 md:grid-cols-3">
            {(Object.keys(VARIANTS) as VariantKey[]).map((key) => (
              <li key={key} className="flex">
                <Link
                  href={`/design-lab/${key}${query}`}
                  className="flex w-full flex-col gap-2 rounded-card border border-line bg-surface-1 p-6 transition-colors duration-400 ease-standard hover:border-line-strong"
                >
                  <span className="font-data text-micro uppercase tracking-caps text-text-muted">
                    Wariant {key.toUpperCase()}
                  </span>
                  <span className="text-h3 font-semibold">„{VARIANTS[key].name}”</span>
                  <span className="text-small text-text-muted">{DESCRIPTIONS[key]}</span>
                  <span className="mt-auto pt-4 font-data text-micro text-text-muted">
                    {VARIANTS[key].fonts}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <TileStatesSection today={DEMO_TODAY} />
      </main>
    </LabShell>
  )
}
