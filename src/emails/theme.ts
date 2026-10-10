/**
 * Kolory e-maili i obrazków OG: programy pocztowe i satori nie znają zmiennych CSS, więc wartości jasnego motywu
 * z tokenów (`globals.css`, ADR 0024) są tu literałami. Zmieniasz token – zmień też tutaj.
 */
export const emailTheme = {
  bg: '#F6F6F8',
  surface: '#FFFFFF',
  line: '#DEDDE3',
  tile: '#E7E6EC',
  text: '#1B1B1F',
  muted: '#5E5D66',
  accent: '#5B2EBF',
  onAccent: '#FFFFFF',
  font: 'Arial, Helvetica, sans-serif',
} as const
