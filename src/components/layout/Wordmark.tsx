import Link from 'next/link'

import { cn } from '@/lib/cn'

/** Znak: dwa położone kafle i wolny – ten sam motyw co pasek terminu. */
export function Wordmark({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      className={cn(
        'flex items-center gap-2.5 font-display text-lead font-medium tracking-tight',
        className,
      )}
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
