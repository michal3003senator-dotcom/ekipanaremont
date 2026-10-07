import { Instrument_Sans } from 'next/font/google'

// Krój z ADR 0013/0015, serwowany z własnej domeny (next/font). Liczby: cyfry tabelaryczne tego kroju.
const instrumentSans = Instrument_Sans({
  subsets: ['latin', 'latin-ext'],
  axes: ['wdth'],
  variable: '--font-instrument',
})

/** Klasa ustawiająca zmienną kroju; trafia na `<html>`. */
export const fontVariables = instrumentSans.variable
