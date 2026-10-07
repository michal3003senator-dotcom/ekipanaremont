import {
  type JSXConvertersFunction,
  LinkJSXConverter,
  RichText,
} from '@payloadcms/richtext-lexical/react'

import type { ComponentProps } from 'react'

import { cn } from '@/lib/cn'

/** Adres dokumentu podlinkowanego w edytorze (link wewnętrzny Lexical). */
function internalHref({ linkNode }: { linkNode: { fields: { doc?: unknown } } }): string {
  const doc = linkNode.fields.doc as { relationTo?: string; value?: unknown } | undefined
  const value = doc?.value as { slug?: string } | string | undefined
  const slug = typeof value === 'object' ? value?.slug : undefined
  if (!slug) return '/'
  if (doc?.relationTo === 'articles') return `/artykuly/${slug}`
  if (doc?.relationTo === 'calculators') return `/kalkulatory/${slug}`
  return `/${slug}`
}

const converters: JSXConvertersFunction = ({ defaultConverters }) => ({
  ...defaultConverters,
  ...LinkJSXConverter({ internalDocToHref: internalHref }),
})

/** Treść z edytora wyłącznie rendererem Lexical (CLAUDE.md: bez dangerouslySetInnerHTML). */
export function RichContent({ data, className }: { data: unknown; className?: string }) {
  if (!data || typeof data !== 'object') return null
  return (
    <RichText
      data={data as ComponentProps<typeof RichText>['data']}
      converters={converters}
      className={cn('rich-text text-body', className)}
    />
  )
}
