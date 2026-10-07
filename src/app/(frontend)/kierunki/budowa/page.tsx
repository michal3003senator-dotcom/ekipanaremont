import Image from 'next/image'
import Link from 'next/link'

import { formatRating } from '@/lib/format/number'

import { PROJECTS } from '../../styleguide/_data'
import { DAYS, ROWS } from '../_rows'
import './budowa.css'

const SELECTS = [
  {
    label: 'Co robimy',
    name: 'usluga',
    options: ['Remont łazienki', 'Układanie płytek', 'Malowanie i gładzie'],
  },
  { label: 'Gdzie', name: 'miejscowosc', options: ['Łódź', 'Zgierz', 'Pabianice'] },
  { label: 'Od kiedy', name: 'termin', options: ['w ciągu 14 dni', 'w ciągu 7 dni', 'obojętnie'] },
]

/** Kierunek 2 „Kartka z budowy”. */
export default function BudowaPage() {
  const project = PROJECTS[0]
  if (!project) return null

  return (
    <div className="budowa">
      <header className="budowa-header">
        <div className="budowa-wrap">
          <Link href="/kierunki" className="budowa-mark budowa-cond">
            <i aria-hidden="true" />
            Ekipa na Termin
          </Link>
          <nav className="budowa-nav" aria-label="Menu główne">
            <a href="#grafik">Grafik ekip</a>
            <a href="#realizacja">Realizacje</a>
            <a href="#">Dla firm</a>
            <a href="#">Zaloguj się</a>
          </nav>
        </div>
      </header>
      <div className="budowa-tape" aria-hidden="true" />

      <main className="budowa-wrap">
        <section className="budowa-hero">
          <h1 className="budowa-cond">Kto wejdzie na budowę najszybciej?</h1>
          <p>
            Grafik ekip remontowych z województwa łódzkiego. Każda firma sama wpisuje pierwszy wolny
            dzień i&nbsp;potwierdza go co dwa tygodnie – niepotwierdzony znika.
          </p>
          <form className="budowa-order" action="#grafik">
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
            <button type="submit">Pokaż ekipy</button>
          </form>
        </section>

        <section id="grafik" className="budowa-board" aria-label="Grafik ekip na 14 dni">
          <table>
            <thead>
              <tr>
                <th scope="col">Ekipa</th>
                {DAYS.map((day, index) => (
                  <th
                    key={day.date}
                    scope="col"
                    data-today={index === 0 ? '' : undefined}
                    data-week-start={day.weekStart ? '' : undefined}
                  >
                    {index === 0 ? 'Dziś' : day.weekday}
                    <br />
                    {day.day}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ROWS.map(({ firm, tiles, from }) => (
                <tr key={firm.slug}>
                  <th scope="row" className="budowa-crew">
                    <strong>{firm.name}</strong>
                    <span>
                      {firm.locality}
                      {firm.rating !== null && ` · ${formatRating(firm.rating)} (${firm.reviews})`}
                      {' · '}
                      {from ? `wolne od ${from}` : 'zapytaj o termin'}
                    </span>
                  </th>
                  {tiles.map((tile) => (
                    <td
                      key={tile.date}
                      className="budowa-cell"
                      data-tile={tile.kind}
                      data-week-start={tile.weekStart ? '' : undefined}
                    >
                      <div>
                        {tile.kind === 'free' ? 'Wolne' : tile.kind === 'beyond' ? '→' : ''}
                      </div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section id="realizacja" className="budowa-photo">
          <div className="budowa-photo-img">
            <Image
              src={project.photo.src}
              alt={project.photo.alt}
              fill
              sizes="(min-width: 1024px) 66vw, 100vw"
              placeholder="blur"
            />
          </div>
          <div className="budowa-photo-text">
            <span className="budowa-label">Realizacja · wrzesień 2026</span>
            <h2 className="budowa-cond">
              {project.title}
              <br />
              {project.locality}
            </h2>
            <p>
              Pracownia Glazury Kowal · zdjęcie poglądowe
              <br />
              <strong>Wolne od 14 paź</strong>, potwierdzone wczoraj.
            </p>
          </div>
        </section>
      </main>
    </div>
  )
}
