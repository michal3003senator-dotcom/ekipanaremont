import Link from 'next/link'

import { Button } from '@/components/ui/Button'

/** Przycisk w treści – drugorzędny: główna akcja ekranu jest jedna (DESIGN §3). */
export function CtaBlock({ label, href }: { label: string; href: string }) {
  const external = /^https:\/\//.test(href)
  return (
    <p>
      <Button asChild variant="secondary">
        {external ? (
          <a href={href} rel="noopener noreferrer" target="_blank">
            {label}
          </a>
        ) : (
          <Link href={href}>{label}</Link>
        )}
      </Button>
    </p>
  )
}
