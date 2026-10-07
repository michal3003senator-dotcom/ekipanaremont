import Link from 'next/link'

import { footerGroups } from './navigation'
import { Wordmark } from './Wordmark'

export async function SiteFooter() {
  const groups = await footerGroups()
  return (
    <footer className="border-t border-line">
      <div className="mx-auto grid max-w-page gap-10 px-4 py-14 md:grid-cols-12 md:px-6">
        <div className="flex flex-col gap-3 md:col-span-4">
          <Wordmark />
          <p className="max-w-prose text-small text-text-muted">
            Firmy remontowe z województwa łódzkiego z najbliższym wolnym terminem. Łączymy klientów
            z firmami; nie jesteśmy stroną umów na prace.
          </p>
        </div>
        {groups.length > 0 && (
          <div className="grid grid-cols-2 gap-x-6 gap-y-8 md:col-span-8 lg:grid-cols-4">
            {groups.map((group) => (
              <nav key={group.title} aria-label={group.title}>
                <h2 className="text-micro font-medium uppercase tracking-caps text-text">
                  {group.title}
                </h2>
                <ul className="mt-2 text-small">
                  {group.links.map((link) => (
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
            ))}
          </div>
        )}
        <p className="font-data text-micro text-text-muted md:col-span-12">
          © 2026 Ekipa na Termin
        </p>
      </div>
    </footer>
  )
}
