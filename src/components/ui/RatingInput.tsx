'use client'

import { Star } from 'lucide-react'
import { useState } from 'react'

import { cn } from '@/lib/cn'

import { Icon } from './Icon'

const LABELS = ['bardzo źle', 'źle', 'przeciętnie', 'dobrze', 'bardzo dobrze']

type Props = {
  name: string
  legend: string
  defaultValue?: number
  error?: string
  onValueChange?: (value: number) => void
}

/** Wybór oceny 1–5: natywne pola radio (klawiatura: strzałki), gwiazdki jako obraz. */
export function RatingInput({ name, legend, defaultValue, error, onValueChange }: Props) {
  const [value, setValue] = useState(defaultValue ?? 0)
  const [hovered, setHovered] = useState(0)
  const shown = hovered || value

  return (
    <fieldset className="flex flex-col gap-2" aria-invalid={error ? true : undefined}>
      <legend className="text-small font-medium">{legend}</legend>
      <div className="flex items-center gap-1" onMouseLeave={() => setHovered(0)}>
        {LABELS.map((label, index) => {
          const star = index + 1
          return (
            <label
              key={star}
              onMouseEnter={() => setHovered(star)}
              className="relative flex size-11 cursor-pointer items-center justify-center rounded-control has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-accent"
            >
              <input
                type="radio"
                name={name}
                value={star}
                checked={value === star}
                onChange={() => {
                  setValue(star)
                  onValueChange?.(star)
                }}
                className="peer sr-only"
              />
              <Icon
                icon={Star}
                className={cn(
                  'size-7 transition-colors duration-150',
                  star <= shown ? 'fill-text text-text' : 'text-line-strong',
                )}
              />
              <span className="sr-only">
                {star} – {label}
              </span>
            </label>
          )
        })}
        <span className="ms-2 text-small text-text-muted" aria-hidden="true">
          {shown ? LABELS[shown - 1] : ''}
        </span>
      </div>
      {error && <p className="text-small text-danger">{error}</p>}
    </fieldset>
  )
}
