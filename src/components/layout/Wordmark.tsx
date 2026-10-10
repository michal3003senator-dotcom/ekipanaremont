import Link from 'next/link'

import { cn } from '@/lib/cn'

import { LogoMark } from './LogoMark'

/** Logo: znak kalendarza z wolnym kaflem i nazwa – „Termin” w kolorze akcentu (ADR 0024). */
export function Wordmark({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      aria-label="Ekipa na Termin – strona główna"
      className={cn('flex items-center gap-2 font-display text-lead tracking-tight', className)}
    >
      <LogoMark className="h-7 w-8" />
      <span>
        Ekipa na <strong className="font-extrabold text-accent-soft">Termin</strong>
      </span>
    </Link>
  )
}
