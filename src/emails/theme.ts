/**
 * Kolory e-maili: programy pocztowe nie znają zmiennych CSS, więc wartości jasnego motywu
 * z tokenów (`globals.css`, ADR 0020) są tu literałami. Zmieniasz token – zmień też tutaj.
 */
export const emailTheme = {
  bg: '#F7F7F4',
  surface: '#FFFFFF',
  line: '#E3E3DE',
  text: '#111318',
  muted: '#5D6270',
  accent: '#6B3FF5',
  onAccent: '#FFFFFF',
  font: 'Arial, Helvetica, sans-serif',
} as const
