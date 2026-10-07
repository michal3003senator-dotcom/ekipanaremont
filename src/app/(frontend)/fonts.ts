import { Instrument_Sans, JetBrains_Mono } from 'next/font/google'

// Kroje z ADR 0013, serwowane z własnej domeny (next/font). next/font wymaga literałów w opcjach.
const instrumentSans = Instrument_Sans({
  subsets: ['latin', 'latin-ext'],
  axes: ['wdth'],
  variable: '--font-instrument',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-jetbrains',
})

/** Klasy ustawiające zmienne krojów; trafiają na `<html>`. */
export const fontVariables = `${instrumentSans.variable} ${jetbrainsMono.variable}`
