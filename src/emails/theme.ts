/**
 * Kolory e-maili: programy pocztowe nie znają zmiennych CSS, więc wartości jasnego motywu
 * z tokenów (`globals.css`, ADR 0015) są tu literałami. Zmieniasz token – zmień też tutaj.
 */
export const emailTheme = {
  bg: '#F6F5F9',
  surface: '#FFFFFF',
  line: '#DEDAE6',
  text: '#16121D',
  muted: '#5E5869',
  accent: '#5A2FE0',
  onAccent: '#FFFFFF',
  font: 'Arial, Helvetica, sans-serif',
} as const
