import type { Metadata } from 'next'

import { ArticleList, pageFrom } from './ArticleList'

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> }

export const metadata: Metadata = {
  title: 'Poradnik remontowy – Ekipa na Termin',
  description:
    'Jak zaplanować remont, ile kosztuje i na co uważać przy wyborze ekipy. Poradniki dla województwa łódzkiego.',
  alternates: { canonical: '/artykuly' },
}

export default async function ArticlesPage({ searchParams }: Props) {
  const page = pageFrom((await searchParams).strona)
  return (
    <ArticleList
      title="Poradnik remontowy"
      lead="Jak zaplanować remont, ile kosztuje i na co uważać przy wyborze ekipy."
      page={page}
      basePath="/artykuly"
    />
  )
}
