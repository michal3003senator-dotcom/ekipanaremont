import { ChevronDown } from 'lucide-react'
import type { ComponentProps } from 'react'

import { cn } from '@/lib/cn'

import { Icon } from './Icon'
import { fieldClasses } from './Input'

export type SelectOption = { value: string; label: string }

type Props = ComponentProps<'select'> & {
  options: readonly SelectOption[]
  /** Pierwsza, pusta opcja, np. „Wybierz usługę”. */
  placeholder?: string
}

/** Natywna lista: na telefonie otwiera systemowy wybór (ADR 0014). */
export function Select({ options, placeholder, className, ...props }: Props) {
  return (
    <div className="relative">
      <select className={cn(fieldClasses, 'h-12 appearance-none ps-4 pe-11', className)} {...props}>
        {placeholder !== undefined && <option value="">{placeholder}</option>}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <Icon
        icon={ChevronDown}
        className="pointer-events-none absolute end-4 top-1/2 size-4 -translate-y-1/2 text-text-muted"
      />
    </div>
  )
}
