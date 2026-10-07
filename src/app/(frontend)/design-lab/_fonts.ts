import {
  Geist_Mono,
  Instrument_Sans,
  JetBrains_Mono,
  Martian_Mono,
  Mona_Sans,
  Onest,
  Schibsted_Grotesk,
} from 'next/font/google'

// Kroje serwowane z własnej domeny (next/font); ładowane tylko na trasie /design-lab.
// next/font wymaga literałów w opcjach – bez wspólnych zmiennych.

const schibsted = Schibsted_Grotesk({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-schibsted',
})
const onest = Onest({ subsets: ['latin', 'latin-ext'], variable: '--font-onest' })
const geistMono = Geist_Mono({ subsets: ['latin', 'latin-ext'], variable: '--font-geist-mono' })
const instrument = Instrument_Sans({
  subsets: ['latin', 'latin-ext'],
  axes: ['wdth'],
  variable: '--font-instrument',
})
const jetbrains = JetBrains_Mono({ subsets: ['latin', 'latin-ext'], variable: '--font-jetbrains' })
const mona = Mona_Sans({ subsets: ['latin', 'latin-ext'], axes: ['wdth'], variable: '--font-mona' })
const martian = Martian_Mono({
  subsets: ['latin', 'latin-ext'],
  axes: ['wdth'],
  variable: '--font-martian',
})

export const fontVariables = [schibsted, onest, geistMono, instrument, jetbrains, mona, martian]
  .map((font) => font.variable)
  .join(' ')
