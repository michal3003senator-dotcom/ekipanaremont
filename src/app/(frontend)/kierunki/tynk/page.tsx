import Image from 'next/image'
import Link from 'next/link'

import { formatRating } from '@/lib/format/number'

import { FIRMS, PROJECTS } from '../../styleguide/_data'
import { DAYS, ROWS } from '../_rows'
import './tynk.css'

const SELECTS = [
  {
    label: 'Usługa',
    name: 'usluga',
    options: ['Remont łazienki', 'Układanie płytek', 'Malowanie i gładzie'],
  },
  { label: 'Gdzie', name: 'miejscowosc', options: ['Łódź', 'Zgierz', 'Pabianice'] },
  { label: 'Start', name: 'termin', options: ['w ciągu 14 dni', 'w ciągu 7 dni', 'obojętnie'] },
]

/** Kierunek 1 „Tynk i fuga”. */
export default function TynkPage() {
  const hero = PROJECTS[0]
  if (!hero) return null

  return (
    <div className="tynk">
      <header className="tynk-header">
        <div className="tynk-wrap">
          <Link href="/kierunki" className="tynk-mark">
            <i aria-hidden="true">
              <b />
              <b />
              <b />
            </i>
            Ekipa na Termin
          </Link>
          <nav className="tynk-nav" aria-label="Menu główne">
            <a href="#sciana">Szukaj firm</a>
            <a href="#firmy">Realizacje</a>
            <a href="#firmy">Dla firm</a>
          </nav>
          <a className="tynk-login" href="#">
            Zaloguj się
          </a>
        </div>
      </header>

      <main>
        <section className="tynk-wrap tynk-hero">
          <div>
            <p className="tynk-eyebrow">Remonty · województwo łódzkie</p>
            <h1>
              Pierwsza wolna ekipa w&nbsp;Łodzi zaczyna <em>14&nbsp;października</em>.
            </h1>
            <p className="tynk-lead">
              Firmy same wpisują najbliższy wolny termin i&nbsp;potwierdzają go co dwa tygodnie.
              Niepotwierdzony znika z&nbsp;wyników.
            </p>
            <form className="tynk-search" action="#sciana">
              {SELECTS.map((select) => (
                <label key={select.name}>
                  {select.label}
                  <select name={select.name}>
                    {select.options.map((option) => (
                      <option key={option}>{option}</option>
                    ))}
                  </select>
                </label>
              ))}
              <button type="submit">Pokaż firmy</button>
            </form>
          </div>
          <figure className="tynk-photo">
            <Image
              src={hero.photo.src}
              alt={hero.photo.alt}
              fill
              sizes="(min-width: 1024px) 40vw, 100vw"
              placeholder="blur"
              loading="eager"
            />
            <figcaption>
              <span>
                {hero.title}, {hero.locality}
              </span>
              <span>zdjęcie poglądowe</span>
            </figcaption>
          </figure>
        </section>

        <section id="sciana" className="tynk-wall">
          <div className="tynk-wrap">
            <h2>Kto ma wolne w najbliższych 14 dniach</h2>
            <p className="tynk-wall-note">
              Płytki to dni zajęte. Zielona – pierwszy wolny dzień firmy.
            </p>
            <div className="tynk-board">
              <div className="tynk-row" aria-hidden="true">
                <span />
                <div className="tynk-tiles tynk-days">
                  {DAYS.map((day) => (
                    <span key={day.date} data-week-start={day.weekStart ? '' : undefined}>
                      {day.weekday} {day.day}
                    </span>
                  ))}
                </div>
                <span />
              </div>
              {ROWS.map(({ firm, tiles, from }) => (
                <div key={firm.slug} className="tynk-row">
                  <div>
                    <p className="tynk-row-name">{firm.name}</p>
                    <p className="tynk-row-meta">
                      {firm.locality}
                      {firm.rating !== null && ` · ${formatRating(firm.rating)} (${firm.reviews})`}
                    </p>
                  </div>
                  <div className="tynk-tiles" aria-hidden="true">
                    {tiles.map((tile) => (
                      <span
                        key={tile.date}
                        data-tile={tile.kind}
                        data-week-start={tile.weekStart ? '' : undefined}
                      >
                        {tile.kind === 'free'
                          ? Number(tile.date.slice(8))
                          : tile.kind === 'beyond'
                            ? '→'
                            : ''}
                      </span>
                    ))}
                  </div>
                  <p className="tynk-from">
                    {from ? `od ${from}` : 'Zapytaj o termin'}
                    {firm.confirmedOn && from && <small>potwierdzony</small>}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="firmy" className="tynk-results">
          <div className="tynk-wrap">
            <h2>Firmy z wolnym terminem</h2>
            <div className="tynk-grid">
              {FIRMS.map((firm) => {
                const row = ROWS.find((item) => item.firm.slug === firm.slug)
                return (
                  <Link
                    key={firm.slug}
                    href={`/styleguide/przejscie/${firm.slug}`}
                    className="tynk-card"
                  >
                    <div className="tynk-card-photo">
                      <Image
                        src={firm.photo.src}
                        alt={firm.photo.alt}
                        fill
                        sizes="(min-width: 1024px) 33vw, 100vw"
                        placeholder="blur"
                      />
                      <span className="tynk-tag">zdjęcie poglądowe</span>
                    </div>
                    <div className="tynk-card-body">
                      <strong className="tynk-row-name">{firm.name}</strong>
                      <span className="tynk-row-meta">
                        {firm.services} · {firm.locality}
                      </span>
                      <span className="tynk-card-term" data-none={row?.from ? undefined : ''}>
                        {row?.from ? `Wolny od ${row.from}` : 'Zapytaj o termin'}
                      </span>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
