/** Cytat: linia fugi po lewej, bez ozdobnych cudzysłowów (DESIGN §2). */
export function QuoteBlock({ text, author }: { text: string; author?: string | null }) {
  return (
    <figure className="border-s-2 border-accent ps-6">
      <blockquote className="font-display text-h3 font-medium text-pretty">{text}</blockquote>
      {author && <figcaption className="mt-3 text-small text-text-muted">{author}</figcaption>}
    </figure>
  )
}
