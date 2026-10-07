import { Archivo } from 'next/font/google'

// Krój z ADR 0020, serwowany z własnej domeny (next/font). Oś szerokości dla nagłówków, cyfry tabelaryczne w danych.
const archivo = Archivo({
  subsets: ['latin', 'latin-ext'],
  axes: ['wdth'],
  variable: '--font-archivo',
})

/** Klasa ustawiająca zmienną kroju; trafia na `<html>`. */
export const fontVariables = archivo.variable
