import type { ReactNode } from 'react'

import type { Article } from '@/payload-types'

import { RichContent } from '../RichContent'
import { CtaBlock } from './CtaBlock'
import { FaqBlock } from './FaqBlock'
import { GalleryBlock } from './GalleryBlock'
import { HeadingBlock } from './HeadingBlock'
import { ImageBlock } from './ImageBlock'
import { QuoteBlock } from './QuoteBlock'
import { RecommendedFirmsBlock } from './RecommendedFirmsBlock'
import { TableBlock } from './TableBlock'

export type ContentBlock = NonNullable<Article['content']>[number]

type Props = {
  blocks: readonly ContentBlock[] | null | undefined
  /** Kalkulator renderuje strona (flaga modułu, parametry z CMS) – tu tylko miejsce w treści. */
  renderCalculator?: (calculator: unknown) => ReactNode
}

function renderBlock(block: ContentBlock, renderCalculator: Props['renderCalculator']) {
  switch (block.blockType) {
    case 'text':
      return <RichContent data={block.body} />
    case 'heading':
      return <HeadingBlock text={block.text} level={block.level} />
    case 'image':
      return <ImageBlock image={block.image} caption={block.caption} />
    case 'gallery':
      return <GalleryBlock images={block.images} />
    case 'quote':
      return <QuoteBlock text={block.text} author={block.author} />
    case 'faq':
      return <FaqBlock items={block.items ?? []} />
    case 'table':
      return <TableBlock caption={block.caption} header={block.header} rows={block.rows} />
    case 'cta':
      return <CtaBlock label={block.label} href={block.href} />
    case 'calculator':
      return renderCalculator?.(block.calculator) ?? null
    case 'recommendedFirms':
      return (
        <RecommendedFirmsBlock
          service={block.service}
          locality={block.locality}
          limit={block.limit}
        />
      )
    default:
      return null
  }
}

/** Treść z bloków CMS (SPEC 3.8) – kolejne bloki w rytmie odstępów ze skali. */
export function RenderBlocks({ blocks, renderCalculator }: Props) {
  if (!blocks?.length) return null
  return (
    <div className="flex flex-col gap-8">
      {blocks.map((block, index) => (
        <div key={block.id ?? index}>{renderBlock(block, renderCalculator)}</div>
      ))}
    </div>
  )
}
