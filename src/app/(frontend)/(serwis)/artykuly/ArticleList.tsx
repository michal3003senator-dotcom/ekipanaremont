import { BookOpen } from 'lucide-react'
import Link from 'next/link'

import { ArticleCard } from '@/components/features/content/ArticleCard'
import { Pagination } from '@/components/ui/Pagination'
import { EmptyState } from '@/components/ui/States'
import { cn } from '@/lib/cn'
import { allCategories, listArticles } from '@/lib/content/articles'
import { publicContext } from '@/lib/search/context'

type Props = {
  title: string
  lead: string
  /** Wybrana kategoria (slug) – lista filtrowana, zakładka zaznaczona. */
  category?: { id: string; slug: string }
  page: number
  basePath: string
}

/** Lista artykułów z zakładkami kategorii – wspólna dla `/artykuly` i stron kategorii. */
export async function ArticleList({ title, lead, category, page, basePath }: Props) {
  const { payload } = await publicContext()
  const [categories, result] = await Promise.all([
    allCategories(payload),
    listArticles(payload, { category: category?.id, page }),
  ])

  return (
    <div className="mx-auto flex max-w-page flex-col gap-10 px-4 py-10 md:px-6 md:py-16">
      <header className="flex max-w-3xl flex-col gap-3">
        <h1 className="font-display text-h1 font-medium">{title}</h1>
        <p className="text-lead text-text-muted text-pretty">{lead}</p>
      </header>
      {categories.length > 0 && (
        <nav aria-label="Kategorie" className="flex flex-wrap gap-2 text-small">
          {[{ id: '', slug: '', name: 'Wszystkie' }, ...categories].map((item) => {
            const current = (category?.slug ?? '') === item.slug
            return (
              <Link
                key={item.id || 'all'}
                href={item.slug ? `/artykuly/kategoria/${item.slug}` : '/artykuly'}
                aria-current={current ? 'page' : undefined}
                className={cn(
                  'flex min-h-11 items-center rounded-control border px-4 transition-colors duration-150',
                  current
                    ? 'border-text bg-text text-bg'
                    : 'border-line bg-surface-1 hover:border-line-strong',
                )}
              >
                {item.name}
              </Link>
            )
          })}
        </nav>
      )}
      {result.docs.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="Jeszcze nie ma artykułów"
          description="Poradniki o remontach pojawią się tu wkrótce. Do tego czasu sprawdź firmy z wolnym terminem."
          action={
            <Link
              href="/szukaj"
              className="text-small font-medium text-accent-soft underline underline-offset-4"
            >
              Szukam firmy
            </Link>
          }
        />
      ) : (
        <ul className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {result.docs.map((article) => (
            <li key={article.id}>
              <ArticleCard article={article} />
            </li>
          ))}
        </ul>
      )}
      {result.totalPages > 1 && (
        <Pagination
          page={page}
          totalPages={result.totalPages}
          hrefFor={(next) => (next === 1 ? basePath : `${basePath}?strona=${next}`)}
        />
      )}
    </div>
  )
}

export const pageFrom = (value: string | string[] | undefined) => {
  const page = Number(Array.isArray(value) ? value[0] : value)
  return Number.isInteger(page) && page > 0 && page < 500 ? page : 1
}
