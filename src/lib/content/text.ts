/** Tekst z treści do liczenia czasu czytania – bez znaczników, z bloków i edytora Lexical. */

type LexicalNode = { text?: unknown; children?: unknown }

export function lexicalText(node: unknown): string {
  if (!node || typeof node !== 'object') return ''
  const current = node as LexicalNode & { root?: unknown }
  if (current.root) return lexicalText(current.root)
  const own = typeof current.text === 'string' ? current.text : ''
  const children = Array.isArray(current.children)
    ? current.children.map(lexicalText).join(' ')
    : ''
  return `${own} ${children}`.trim()
}

type Block = Record<string, unknown> & { blockType?: string }

/** Tekst bloków artykułu lub strony (kalkulator i polecane firmy nie mają treści do czytania). */
export function blocksText(blocks: unknown): string {
  if (!Array.isArray(blocks)) return ''
  return blocks
    .map((block: Block) => {
      switch (block.blockType) {
        case 'text':
          return lexicalText(block.body)
        case 'heading':
        case 'quote':
          return String(block.text ?? '')
        case 'faq':
          return (Array.isArray(block.items) ? block.items : [])
            .map((item: Block) => `${item.question ?? ''} ${item.answer ?? ''}`)
            .join(' ')
        case 'table':
          return (Array.isArray(block.rows) ? block.rows : [])
            .map((row: Block) => (Array.isArray(row.cells) ? row.cells.join(' ') : ''))
            .join(' ')
        default:
          return ''
      }
    })
    .join(' ')
}

/** Czas czytania w minutach (200 słów na minutę, co najmniej 1). */
export function readingMinutes(text: string): number {
  const words = text.split(/\s+/).filter(Boolean).length
  return Math.max(1, Math.round(words / 200))
}
