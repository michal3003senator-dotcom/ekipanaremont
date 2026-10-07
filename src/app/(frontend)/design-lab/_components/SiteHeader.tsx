import Link from 'next/link'

/** Znak: dwa położone kafle i wolny – ten sam motyw co pasek terminu. */
export function Wordmark() {
  return (
    <Link
      href="/"
      className="flex items-center gap-2.5 font-display text-lead font-semibold tracking-tight"
    >
      <svg viewBox="0 0 22 14" className="h-3.5 w-auto" aria-hidden="true">
        <rect x="0" width="6" height="14" rx="1.5" className="fill-line" />
        <rect x="8" width="6" height="14" rx="1.5" className="fill-line" />
        <rect x="16" width="6" height="14" rx="1.5" className="fill-accent" />
      </svg>
      Ekipa na Termin
    </Link>
  )
}

export function SiteHeader() {
  return (
    <header className="border-b border-line">
      <div className="mx-auto flex h-16 max-w-page items-center justify-between gap-6 px-4 md:px-6">
        <Wordmark />
        <nav aria-label="Konto" className="flex items-center gap-6 text-small">
          <a
            href="/rejestracja"
            className="text-text-muted transition-colors duration-150 hover:text-text"
          >
            Dla firm
          </a>
          <a
            href="/logowanie"
            className="text-text-muted transition-colors duration-150 hover:text-text"
          >
            Zaloguj się
          </a>
        </nav>
      </div>
    </header>
  )
}
