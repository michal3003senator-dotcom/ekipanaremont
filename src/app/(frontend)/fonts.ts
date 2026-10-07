import localFont from 'next/font/local'

// Krój z ADR 0020 jako własny podzbiór (ADR 0021): łacinka z polskimi literami, osie wght 400–600
// i wdth 100–108 (nagłówki), jeden plik ~40 KB z własnej domeny. Odtworzenie: scripts/fonts/subset-archivo.sh.
const archivo = localFont({
  src: '../../../assets/fonts/archivo-pl.woff2',
  weight: '400 600',
  style: 'normal',
  display: 'swap',
  variable: '--font-archivo',
  declarations: [{ prop: 'font-stretch', value: '100% 108%' }],
  adjustFontFallback: 'Arial',
  fallback: ['ui-sans-serif', 'system-ui', 'sans-serif'],
})

/** Klasa ustawiająca zmienną kroju; trafia na `<html>`. */
export const fontVariables = archivo.variable
