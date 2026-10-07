import { type ClassValue, clsx } from 'clsx'
import { extendTailwindMerge } from 'tailwind-merge'

// tailwind-merge musi znać tokeny projektu, inaczej np. `text-micro` (rozmiar) i `text-text-muted` (kolor)
// uznałby za konflikt. Listy odpowiadają @theme w src/app/(frontend)/globals.css.
const twMerge = extendTailwindMerge({
  extend: {
    theme: {
      color: [
        'bg',
        'surface-1',
        'surface-2',
        'line',
        'line-strong',
        'text',
        'text-muted',
        'accent',
        'accent-hover',
        'accent-soft',
        'on-accent',
        'success',
        'danger',
        'scrim',
        'on-scrim',
      ],
      text: ['display', 'h1', 'h2', 'h3', 'lead', 'body', 'small', 'micro'],
      font: ['sans', 'display', 'data'],
      radius: ['card', 'control', 'badge', 'tile', 'tile-lg'],
      shadow: ['float'],
      tracking: ['tight', 'caps'],
      ease: ['standard'],
      container: ['page'],
    },
  },
})

/** Łączy klasy i rozwiązuje konflikty Tailwinda (późniejsza klasa wygrywa). */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}
