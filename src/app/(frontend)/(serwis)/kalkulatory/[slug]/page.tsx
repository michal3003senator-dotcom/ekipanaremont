import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { CalculatorBlock } from '@/components/features/calculators/CalculatorBlock'
import { PreviewBar } from '@/components/features/content/PreviewBar'
import { Breadcrumbs } from '@/components/ui/Breadcrumbs'
import { calculatorsEnabled, getCalculator } from '@/lib/content/calculators'
import { contentReader } from '@/lib/content/preview'
import { publicContext } from '@/lib/search/context'

type Props = { params: Promise<{ slug: string }> }

async function calculatorFor(params: Props['params']) {
  const { slug } = await params
  const [{ payload }, reader] = await Promise.all([publicContext(), contentReader()])
  return { reader, calculator: await getCalculator(payload, { slug }, reader) }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { calculator } = await calculatorFor(params)
  if (!calculator) return { title: 'Nie znaleźliśmy kalkulatora – Ekipa na Termin' }
  return {
    title: `${calculator.title} – Ekipa na Termin`,
    description: calculator.intro ?? undefined,
    alternates: { canonical: `/kalkulatory/${calculator.slug}` },
  }
}

export default async function CalculatorPage({ params }: Props) {
  if (!(await calculatorsEnabled())) notFound()
  const { reader, calculator } = await calculatorFor(params)
  if (!calculator) notFound()

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-8 px-4 py-8 md:px-6 md:py-12">
      {reader.draft && <PreviewBar path={`/kalkulatory/${calculator.slug}`} />}
      <Breadcrumbs
        items={[{ label: 'Kalkulatory', href: '/kalkulatory' }, { label: calculator.title }]}
      />
      <CalculatorBlock calculator={calculator.id} reader={reader} />
    </div>
  )
}
