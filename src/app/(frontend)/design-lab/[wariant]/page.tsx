import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { DEMO_TODAY, isVariantKey, VARIANTS } from '../_data'
import { HeroA } from '../_components/HeroA'
import { HeroB } from '../_components/HeroB'
import { HeroC } from '../_components/HeroC'
import { ResultsSection, SpecimenSection, TileStatesSection } from '../_components/LabSections'
import { LabShell, themeFromParam } from '../_components/LabShell'
import { SiteHeader } from '../_components/SiteHeader'

type Props = {
  params: Promise<{ wariant: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

const HEROES = { a: HeroA, b: HeroB, c: HeroC }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { wariant } = await params
  if (!isVariantKey(wariant)) return {}
  return { title: `Wariant ${wariant.toUpperCase()} „${VARIANTS[wariant].name}” – design lab` }
}

export default async function VariantPage({ params, searchParams }: Props) {
  const { wariant } = await params
  if (!isVariantKey(wariant)) notFound()

  const theme = themeFromParam((await searchParams).motyw)
  const Hero = HEROES[wariant]

  return (
    <LabShell set={wariant} theme={theme} current={wariant}>
      <SiteHeader />
      <main>
        <Hero today={DEMO_TODAY} />
        <ResultsSection variant={wariant} today={DEMO_TODAY} />
        <TileStatesSection today={DEMO_TODAY} />
        <SpecimenSection set={wariant} />
      </main>
    </LabShell>
  )
}
