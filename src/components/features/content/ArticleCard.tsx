import Image from 'next/image'
import Link from 'next/link'

import { formatInstantDate } from '@/lib/format/date'
import { mediaPhoto } from '@/lib/search/summary'
import type { Article } from '@/payload-types'

/** Karta artykułu: zdjęcie 3:2, kategoria, tytuł, zajawka, data i czas czytania. */
export function ArticleCard({
  article,
  heading = 'h2',
}: {
  article: Article
  heading?: 'h2' | 'h3'
}) {
  const Heading = heading
  const cover = mediaPhoto(article.cover)
  const category = typeof article.category === 'object' ? article.category : null
  return (
    <Link
      href={`/artykuly/${article.slug}`}
      className="group flex h-full flex-col overflow-hidden rounded-card border border-line bg-surface-1 inset-shadow-edge transition-colors duration-400 ease-standard hover:border-line-strong"
    >
      {/* Bez zdjęcia karta jest tekstowa – puste pole niczego nie mówi. */}
      {cover && (
        <div className="relative aspect-3/2 overflow-hidden bg-surface-2">
          <Image
            src={cover.src}
            alt=""
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
            className="object-cover transition-transform duration-400 ease-standard group-hover:scale-103"
          />
        </div>
      )}
      <div className="flex flex-1 flex-col gap-2 p-4 md:p-6">
        {category && (
          <p className="text-micro uppercase tracking-caps text-text-muted">{category.name}</p>
        )}
        <Heading className="font-display text-h3 font-medium text-balance">{article.title}</Heading>
        {article.excerpt && (
          <p className="line-clamp-3 text-small text-text-muted">{article.excerpt}</p>
        )}
        <p className="mt-auto pt-2 font-data text-micro text-text-muted">
          {article.publishedAt && formatInstantDate(article.publishedAt)}
          {article.readingMinutes ? ` · ${article.readingMinutes} min czytania` : ''}
        </p>
      </div>
    </Link>
  )
}
