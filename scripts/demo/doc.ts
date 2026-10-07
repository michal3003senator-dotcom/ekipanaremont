/**
 * Zwięzły zapis treści do danych startowych: akapity, listy, nagłówki i bloki zamieniane na bloki
 * Payload (Lexical). W tekście: **pogrubienie** i [link](/sciezka).
 */
export type CalculatorType = 'bathroomCost' | 'tiles' | 'paint' | 'skimCoat'

export type DocPart =
  | { h2: string }
  | { h3: string }
  | { p: string }
  | { ul: string[] }
  | { ol: string[] }
  | { faq: { q: string; a: string }[] }
  | { table: { caption: string; header: string[]; rows: string[][] } }
  | { quote: string; author?: string }
  | { calculator: CalculatorType }
  | { firms: { service: string; locality?: string } }
  | { cta: { label: string; href: string } }

type LexicalNode = Record<string, unknown>

const base = { version: 1, direction: 'ltr' as const, format: '' as const, indent: 0 }
const BOLD = 1

function textNode(text: string, bold = false): LexicalNode {
  return {
    type: 'text',
    version: 1,
    text,
    format: bold ? BOLD : 0,
    detail: 0,
    mode: 'normal',
    style: '',
  }
}

/** `**pogrubienie**` i `[link](/adres)` w jednym akapicie. */
export function inline(source: string): LexicalNode[] {
  const nodes: LexicalNode[] = []
  const pattern = /\*\*(.+?)\*\*|\[(.+?)\]\(((?:\/|https:\/\/|mailto:)[^)\s]*)\)/g
  let last = 0
  for (const match of source.matchAll(pattern)) {
    if (match.index > last) nodes.push(textNode(source.slice(last, match.index)))
    if (match[1]) nodes.push(textNode(match[1], true))
    else
      nodes.push({
        ...base,
        type: 'link',
        version: 3,
        fields: { linkType: 'custom', url: match[3], newTab: false },
        children: [textNode(match[2]!)],
      })
    last = match.index + match[0].length
  }
  if (last < source.length) nodes.push(textNode(source.slice(last)))
  return nodes
}

const paragraph = (text: string): LexicalNode => ({
  ...base,
  type: 'paragraph',
  textFormat: 0,
  textStyle: '',
  children: inline(text),
})

const list = (items: string[], ordered: boolean): LexicalNode => ({
  ...base,
  type: 'list',
  listType: ordered ? 'number' : 'bullet',
  tag: ordered ? 'ol' : 'ul',
  start: 1,
  children: items.map((item, index) => ({
    ...base,
    type: 'listitem',
    value: index + 1,
    children: inline(item),
  })),
})

export function lexical(children: LexicalNode[]) {
  return { root: { ...base, type: 'root', children } }
}

/** Ids kalkulatorów, usług i miejscowości – bloki odwołują się do dokumentów z bazy. */
export type DocRefs = {
  calculators: Partial<Record<CalculatorType, string>>
  services: Record<string, string>
  localities: Record<string, string>
}

/** Zamienia zapis na bloki; kolejne akapity i listy łączy w jeden blok tekstu. */
export function toBlocks(parts: readonly DocPart[], refs: DocRefs) {
  const blocks: Record<string, unknown>[] = []
  let text: LexicalNode[] = []
  const flush = () => {
    if (text.length) blocks.push({ blockType: 'text', body: lexical(text) })
    text = []
  }
  for (const part of parts) {
    if ('p' in part) text.push(paragraph(part.p))
    else if ('ul' in part) text.push(list(part.ul, false))
    else if ('ol' in part) text.push(list(part.ol, true))
    else {
      flush()
      if ('h2' in part) blocks.push({ blockType: 'heading', text: part.h2, level: 'h2' })
      else if ('h3' in part) blocks.push({ blockType: 'heading', text: part.h3, level: 'h3' })
      else if ('faq' in part)
        blocks.push({
          blockType: 'faq',
          items: part.faq.map(({ q, a }) => ({ question: q, answer: a })),
        })
      else if ('table' in part)
        blocks.push({
          blockType: 'table',
          caption: part.table.caption,
          header: part.table.header,
          rows: part.table.rows.map((cells) => ({ cells })),
        })
      else if ('quote' in part)
        blocks.push({ blockType: 'quote', text: part.quote, author: part.author })
      else if ('calculator' in part) {
        const id = refs.calculators[part.calculator]
        if (id) blocks.push({ blockType: 'calculator', calculator: id })
      } else if ('firms' in part)
        blocks.push({
          blockType: 'recommendedFirms',
          service: refs.services[part.firms.service],
          locality: part.firms.locality ? refs.localities[part.firms.locality] : undefined,
          limit: 3,
        })
      else if ('cta' in part)
        blocks.push({ blockType: 'cta', label: part.cta.label, href: part.cta.href })
    }
  }
  flush()
  return blocks
}

/** Czysty tekst zapisu (np. do sprawdzenia długości). */
export function plainText(parts: readonly DocPart[]): string {
  return parts
    .map((part) =>
      'p' in part
        ? part.p
        : 'ul' in part
          ? part.ul.join(' ')
          : 'ol' in part
            ? part.ol.join(' ')
            : '',
    )
    .join(' ')
}
