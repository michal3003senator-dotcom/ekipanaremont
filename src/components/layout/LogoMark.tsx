import { cn } from '@/lib/cn'

/** Kafle kalendarza 3×3 (współrzędne w siatce 36×32); ostatni to wolny dzień. */
const TILES = [12.4, 17.4, 22.4].flatMap((y) => [6.7, 11.7, 16.7].map((x) => ({ x, y })))
const FREE = TILES.at(-1)!

/** Ptaszek wyrasta z wolnego kafla i wychodzi za ramkę kalendarza – „termin potwierdzony”. */
const CHECK = 'M14.4 21.2 L18.6 25.4 L33.4 8.6'

/**
 * Znak (ADR 0024): kartka kalendarza z siatką kafli, wolny kafel w akcencie i ptaszek wychodzący
 * z niego poza ramkę. Pod ptaszkiem szersza linia w kolorze tła przerywa ramkę. Kolory z tokenów.
 */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 36 32" className={cn('h-8 w-9 shrink-0', className)} aria-hidden="true">
      <rect
        x="2.25"
        y="6.25"
        width="22.5"
        height="21.5"
        rx="5"
        fill="none"
        strokeWidth="2.5"
        className="stroke-text"
      />
      <path
        d="M8.5 2.75v5.5M18.5 2.75v5.5M8.5 4.6h10"
        strokeWidth="2.5"
        strokeLinecap="round"
        className="stroke-text"
      />
      {TILES.slice(0, -1).map(({ x, y }, index) => (
        <rect key={index} x={x} y={y} width="3.6" height="3.6" rx="1" className="fill-text-muted" />
      ))}
      <path
        d={CHECK}
        fill="none"
        strokeWidth="7.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="stroke-bg"
      />
      <rect x={FREE.x} y={FREE.y} width="3.6" height="3.6" rx="1" className="fill-accent" />
      <path
        d={CHECK}
        pathLength={1}
        fill="none"
        strokeWidth="3.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="logo-check stroke-accent"
      />
    </svg>
  )
}
