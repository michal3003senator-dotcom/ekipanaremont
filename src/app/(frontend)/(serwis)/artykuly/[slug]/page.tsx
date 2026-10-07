import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { ArticleCard } from '@/components/features/content/ArticleCard'
import { RenderBlocks } from '@/components/features/content/blocks/RenderBlocks'
import { Breadcrumbs } from '@/components/ui/Breadcrumbs'
import { faqItems, getArticle, relatedArticles } from '@/lib/content/articles'
import { contentReader } from '@/lib/content/preview'
import { formatInstantDate } from '@/lib/format/date'
import { publicContext } from '@/lib/search/context'
import { mediaPhoto } from '@/lib/search/summary'
import { serializeJsonLd } from '@/lib/seo/json-ld'
import type { Article } from '@/payload-types'

type Props = { params: Promise<{ slug: string }> }

async function articleFor(params: Props['params']) {
  const { slug } = await params
  const [{ payload }, reader] = await Promise.all([publicContext(), contentReader()])
  return { payload, article: await getArticle(payload, slug, reader) }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { article } = await articleFor(params)
  if (!article) return { title: 'Nie znaleźliśmy artykułu – Ekipa na Termin' }
  const image = mediaPhoto(article.seo?.image ?? article.cover, 'large')
  return {
    title: `${article.seo?.title ?? article.title} – Ekipa na Termin`,
    description: article.seo?.description ?? article.excerpt ?? undefined,
    alternates: { canonical: article.seo?.canonical ?? `/artykuly/${article.slug}` },
    openGraph: {
      type: 'article',
      title: article.title,
      description: article.excerpt ?? undefined,
      locale: 'pl_PL',
      publishedTime: article.publishedAt ?? undefined,
      modifiedTime: article.updatedAt,
      images: typeof image?.src === 'string' ? [{ url: image.src }] : undefined,
    },
  }
}

/** Article i – gdy są bloki FAQ – FAQPage (dane strukturalne z bezpieczną serializacją). */
function jsonLd(article: Article, url: string) {
  const faq = faqItems(article)
  const image = mediaPhoto(article.cover, 'large')
  return [
    {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: article.title,
      description: article.excerpt ?? undefined,
      image: typeof image?.src === 'string' ? image.src : undefined,
      datePublished: article.publishedAt ?? undefined,
      dateModified: article.updatedAt,
      author: article.authorName ? { '@type': 'Person', name: article.authorName } : undefined,
      publisher: { '@type': 'Organization', name: 'Ekipa na Termin' },
      mainEntityOfPage: url,
    },
    ...(faq.length
      ? [
          {
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: faq.map((item) => ({
              '@type': 'Question',
              name: item.question,
              acceptedAnswer: { '@type': 'Answer', text: item.answer },
            })),
          },
        ]
      : []),
  ]
}

export default async function ArticlePage({ params }: Props) {
  const { payload, article } = await articleFor(params)
  if (!article) notFound()
  const category = typeof article.category === 'object' ? article.category : null
  const cover = mediaPhoto(article.cover, 'large')
  const related = await relatedArticles(payload, article)
  const url = new URL(
    `/artykuly/${article.slug}`,
    process.env.NEXT_PUBLIC_SERVER_URL ?? 'http://localhost:3000',
  ).toString()

  return (
    <article className="mx-auto flex max-w-page flex-col gap-10 px-4 py-8 md:px-6 md:py-12">
      <script
        type="application/ld+json"
        // Bezpieczne: serializeJsonLd zamienia „<” na <, dane nie zamkną znacznika.
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLd(article, url)) }}
      />
      <Breadcrumbs
        items={[
          { label: 'Poradnik', href: '/artykuly' },
          ...(category?.slug
            ? [{ label: category.name, href: `/artykuly/kategoria/${category.slug}` }]
            : []),
          { label: article.title },
        ]}
      />
      <header className="mx-auto flex w-full max-w-3xl flex-col gap-4">
        {category?.slug && (
          <Link
            href={`/artykuly/kategoria/${category.slug}`}
            className="self-start text-micro uppercase tracking-caps text-accent-soft"
          >
            {category.name}
          </Link>
        )}
        <h1 className="font-display text-h1 font-medium text-balance">{article.title}</h1>
        {article.excerpt && (
          <p className="text-lead text-text-muted text-pretty">{article.excerpt}</p>
        )}
        <p className="font-data text-small text-text-muted">
          {[
            article.authorName,
            `Zaktualizowano ${formatInstantDate(article.updatedAt)}`,
            article.readingMinutes ? `${article.readingMinutes} min czytania` : null,
          ]
            .filter(Boolean)
            .join(' · ')}
        </p>
      </header>
      {cover && (
        <div className="relative mx-auto aspect-video w-full max-w-4xl overflow-hidden rounded-card bg-surface-2">
          <Image
            src={cover.src}
            alt={cover.alt}
            fill
            priority
            sizes="(min-width: 1024px) 896px, 100vw"
            className="object-cover"
          />
        </div>
      )}
      <div className="mx-auto w-full max-w-3xl">
        <RenderBlocks blocks={article.content} />
        {article.tags && article.tags.length > 0 && (
          <ul aria-label="Tagi" className="mt-10 flex flex-wrap gap-2">
            {article.tags.map((tag) => (
              <li
                key={tag}
                className="rounded-badge bg-surface-2 px-3 py-1 text-small text-text-muted"
              >
                {tag}
              </li>
            ))}
          </ul>
        )}
      </div>
      {related.length > 0 && (
        <section aria-labelledby="czytaj-dalej" className="border-t border-line pt-10">
          <h2 id="czytaj-dalej" className="font-display text-h2 font-medium">
            Czytaj dalej
          </h2>
          <ul className="mt-6 grid gap-4 md:grid-cols-3">
            {related.map((item) => (
              <li key={item.id}>
                <ArticleCard article={item} heading="h3" />
              </li>
            ))}
          </ul>
        </section>
      )}
    </article>
  )
}
