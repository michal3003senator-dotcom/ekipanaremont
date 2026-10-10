import localFont from 'next/font/local'

// Krój z ADR 0024 jako własny podzbiór (zasady ADR 0021): łacinka z polskimi literami, oś wght 400–800,
// jeden plik ~24 KB z własnej domeny. Odtworzenie: scripts/fonts/subset-manrope.sh.
const manrope = localFont({
  src: '../../../assets/fonts/manrope-pl.woff2',
  weight: '400 800',
  style: 'normal',
  display: 'swap',
  variable: '--font-manrope',
  adjustFontFallback: 'Arial',
  fallback: ['ui-sans-serif', 'system-ui', 'sans-serif'],
})

/** Klasa ustawiająca zmienną kroju; trafia na `<html>`. */
export const fontVariables = manrope.variable
