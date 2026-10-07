'use client'

import { type ComponentProps, useState } from 'react'

import { cn } from '@/lib/cn'

import { fieldClasses } from './Input'

type Props = ComponentProps<'textarea'> & {
  /** Licznik znaków pod polem, gdy jest `maxLength`. */
  showCount?: boolean
}

export function Textarea({ className, showCount, maxLength, onChange, ...props }: Props) {
  const [length, setLength] = useState(String(props.value ?? props.defaultValue ?? '').length)

  return (
    <div className="flex flex-col gap-1">
      <textarea
        maxLength={maxLength}
        onChange={(event) => {
          setLength(event.target.value.length)
          onChange?.(event)
        }}
        className={cn(fieldClasses, 'min-h-32 resize-y px-4 py-3 leading-normal', className)}
        {...props}
      />
      {showCount && maxLength !== undefined && (
        <p className="self-end font-data text-micro text-text-muted" aria-hidden="true">
          {length}/{maxLength}
        </p>
      )}
    </div>
  )
}
