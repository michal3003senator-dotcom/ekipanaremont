import { slugify } from '@/lib/validation/slug'

/** Nagłówek sekcji z kotwicą (link do fragmentu artykułu). */
export function HeadingBlock({ text, level }: { text: string; level?: 'h2' | 'h3' | null }) {
  const Tag = level === 'h3' ? 'h3' : 'h2'
  return (
    <Tag
      id={slugify(text)}
      className={
        Tag === 'h2'
          ? 'scroll-mt-24 font-display text-h2 font-medium'
          : 'scroll-mt-24 font-display text-h3 font-medium'
      }
    >
      {text}
    </Tag>
  )
}
