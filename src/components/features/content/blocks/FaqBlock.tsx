import { ChevronDown } from 'lucide-react'

import { Icon } from '@/components/ui/Icon'

type Item = { id?: string | null; question: string; answer: string }

/** Pytania i odpowiedzi: natywne <details> – działa bez JavaScriptu i z klawiatury. */
export function FaqBlock({ items }: { items: readonly Item[] }) {
  return (
    <div className="flex flex-col border-t border-line">
      {items.map((item, index) => (
        <details key={item.id ?? index} className="group border-b border-line">
          <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 py-4 font-medium faq-summary">
            {item.question}
            <Icon
              icon={ChevronDown}
              className="size-5 shrink-0 text-text-muted transition-transform duration-150 group-open:rotate-180"
            />
          </summary>
          <p className="max-w-prose pb-5 text-body text-text-muted whitespace-pre-line">
            {item.answer}
          </p>
        </details>
      ))}
    </div>
  )
}
