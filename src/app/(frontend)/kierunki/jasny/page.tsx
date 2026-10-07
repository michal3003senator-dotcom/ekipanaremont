import { Search, Star } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

import { formatRating } from '@/lib/format/number'

import { ROWS } from '../_rows'
import './jasny.css'

const SERVICES = ['Remont łazienki', 'Układanie płytek', 'Malowanie i gładzie', 'Remont kuchni']
const PLACES = ['Łódź', 'Zgierz', 'Pabianice', 'Konstantynów Łódzki']
const STARTS = ['Jak najszybciej', 'W ciągu 7 dni', 'W ciągu 14 dni', 'W ciągu 30 dni']
const QUICK = [
  { usluga: 'Remont łazienki', gdzie: 'Łódź' },
  { usluga: 'Malowanie i gładzie', gdzie: 'Zgierz' },
  { usluga: 'Układanie płytek', gdzie: 'Pabianice' },
]
const PALETTES = [
  { key: 'granat', label: 'Granat', color: '#1f3fd1' },
  { key: 'czern', label: 'Czerń', color: '#111318' },
  { key: 'fiolet', label: 'Fiolet', color: '#6b3ff5' },
] as const

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> }

const pick = (
  value: string | string[] | undefined,
  allowed: readonly string[],
  fallback: string,
) => (typeof value === 'string' && allowed.includes(value) ? value : fallback)

/** Kierunek „Jasny”: jedno oczywiste zadanie – znaleźć firmę z wolnym terminem. */
export default async function JasnyPage({ searchParams }: Props) {
  const params = await searchParams
  const palette = pick(
    params.paleta,
    PALETTES.map((item) => item.key),
    'granat',
  )
  const service = pick(params.usluga, SERVICES, 'Remont łazienki')
  const place = pick(params.gdzie, PLACES, 'Łódź')
  const start = pick(params.start, STARTS, 'Jak najszybciej')
  const withPalette = (query: Record<string, string>) =>
    `?${new URLSearchParams({ ...query, paleta: palette }).toString()}#wyniki`

  return (
    <div className="jasny" data-paleta={palette}>
      <header className="j-header">
        <div className="j-wrap">
          <Link href="/kierunki/jasny" className="j-mark">
            <i aria-hidden="true">
              <b />
              <b />
              <b />
            </i>
            Ekipa na Termin
          </Link>
          <nav aria-label="Menu główne">
            <a className="j-link" href="#jak">
              Jak to działa
            </a>
            <a className="j-link" href="#">
              Zaloguj się
            </a>
            <a className="j-btn-outline" href="#">
              Dodaj firmę
            </a>
          </nav>
        </div>
      </header>

      <main>
        <section className="j-wrap j-hero">
          <h1>
            Znajdź ekipę, która ma <em>wolny termin</em>.
          </h1>
          <p className="j-sub">
            Wybierz, co remontujesz i&nbsp;gdzie. Pokażemy firmy z&nbsp;województwa łódzkiego od
            najbliższego wolnego dnia.
          </p>

          <form className="j-search" action="#wyniki" role="search">
            <input type="hidden" name="paleta" value={palette} />
            <label className="j-field">
              <span>Co remontujesz?</span>
              <select name="usluga" defaultValue={service}>
                {SERVICES.map((option) => (
                  <option key={option}>{option}</option>
                ))}
              </select>
            </label>
            <label className="j-field">
              <span>Gdzie?</span>
              <select name="gdzie" defaultValue={place}>
                {PLACES.map((option) => (
                  <option key={option}>{option}</option>
                ))}
              </select>
            </label>
            <label className="j-field">
              <span>Od kiedy?</span>
              <select name="start" defaultValue={start}>
                {STARTS.map((option) => (
                  <option key={option}>{option}</option>
                ))}
              </select>
            </label>
            <button type="submit">
              <Search size={20} strokeWidth={1.75} aria-hidden="true" />
              Szukaj
            </button>
          </form>

          <div className="j-quick">
            <span>Często szukane:</span>
            {QUICK.map((item) => (
              <Link key={item.usluga} className="j-chip" href={withPalette(item)}>
                {item.usluga} · {item.gdzie}
              </Link>
            ))}
          </div>

          <ol id="jak" className="j-steps">
            <li>
              <i>1</i>
              <span>
                <b>Wybierz prace i miejsce.</b> Bez rejestracji.
              </span>
            </li>
            <li>
              <i>2</i>
              <span>
                <b>Porównaj wolne terminy.</b> Firmy potwierdzają je co dwa tygodnie.
              </span>
            </li>
            <li>
              <i>3</i>
              <span>
                <b>Wyślij zapytanie.</b> Firma odpowie mailem lub telefonicznie.
              </span>
            </li>
          </ol>
        </section>

        <section id="wyniki" className="j-results">
          <div className="j-wrap">
            <div className="j-results-head">
              <h2>
                {service} · {place}
              </h2>
              <p>Najbliższy wolny termin najpierw</p>
            </div>
            <ul className="j-list">
              {ROWS.map(({ firm, tiles, from }) => (
                <li key={firm.slug}>
                  <Link href={`/styleguide/przejscie/${firm.slug}`} className="j-card">
                    <div className="j-photo">
                      <Image
                        src={firm.photo.src}
                        alt={firm.photo.alt}
                        fill
                        sizes="(min-width: 768px) 168px, 100vw"
                        placeholder="blur"
                      />
                      <small>zdjęcie poglądowe</small>
                    </div>
                    <div>
                      <p className="j-name">{firm.name}</p>
                      <p className="j-meta">
                        {firm.services} · {firm.locality}
                      </p>
                      <p className="j-rating">
                        {firm.rating === null ? (
                          <span className="j-meta">Jeszcze bez opinii</span>
                        ) : (
                          <>
                            <Star
                              size={16}
                              strokeWidth={1.75}
                              fill="currentColor"
                              aria-hidden="true"
                            />
                            <b>{formatRating(firm.rating)}</b>
                            <span className="j-meta">({firm.reviews} opinii)</span>
                          </>
                        )}
                        <span className="j-meta">· W rejestrze {firm.registry}</span>
                      </p>
                    </div>
                    <div className="j-term">
                      <div className="j-term-top">
                        <strong>{from ? `Wolny od ${from}` : 'Zapytaj o termin'}</strong>
                        {from && firm.confirmedOn && <small>potwierdzony</small>}
                      </div>
                      <div className="j-tiles" aria-hidden="true">
                        {tiles.map((tile) => (
                          <span
                            key={tile.date}
                            data-tile={tile.kind}
                            data-week-start={tile.weekStart ? '' : undefined}
                          />
                        ))}
                      </div>
                      <span className="j-cta">Zobacz firmę i&nbsp;zapytaj</span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </main>

      <nav className="j-palette" aria-label="Paleta kolorów (do oceny)">
        {PALETTES.map((item) => (
          <Link
            key={item.key}
            href={`?${new URLSearchParams({ paleta: item.key, usluga: service, gdzie: place, start }).toString()}`}
            aria-current={item.key === palette ? 'true' : undefined}
            scroll={false}
          >
            <i style={{ background: item.color }} />
            {item.label}
          </Link>
        ))}
      </nav>
    </div>
  )
}
