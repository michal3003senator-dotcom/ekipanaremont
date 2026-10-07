import Link from 'next/link'

import { footerNav } from './navigation'
import { Wordmark } from './Wordmark'

export async function SiteFooter() {
  const links = await footerNav()
  return (
    <footer className="border-t border-line">
      <div className="mx-auto grid max-w-page gap-8 px-4 py-14 md:grid-cols-12 md:px-6">
        <div className="flex flex-col gap-3 md:col-span-6">
          <Wordmark />
          <p className="max-w-prose text-small text-text-muted">
            Firmy remontowe z województwa łódzkiego z najbliższym wolnym terminem. Łączymy klientów
            z firmami; nie jesteśmy stroną umów na prace.
          </p>
        </div>
        {links.length > 0 && (
          <nav aria-label="Informacje" className="md:col-span-6">
            <ul className="grid gap-x-6 gap-y-1 text-small sm:grid-cols-2">
              {links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="flex min-h-11 items-center text-text-muted transition-colors duration-150 hover:text-text"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        )}
        <p className="font-data text-micro text-text-muted md:col-span-12">
          © 2026 Ekipa na Termin
        </p>
      </div>
    </footer>
  )
}
