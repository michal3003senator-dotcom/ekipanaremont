'use client'

import { ArrowDown, ArrowUp, GripVertical } from 'lucide-react'
import { Reorder, useDragControls, useReducedMotion } from 'motion/react'
import type { ReactNode } from 'react'

import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'

type Props<T> = {
  items: T[]
  getId: (item: T) => string
  /** Nazwa elementu dla czytników ekranu i podpisów przycisków. */
  getLabel: (item: T) => string
  onReorder: (items: T[]) => void
  /** Wywołane po puszczeniu albo kliknięciu strzałki – zapis kolejności. */
  onCommit: (items: T[]) => void
  renderItem: (item: T) => ReactNode
}

/**
 * Lista z kolejnością przeciąganiem (uchwyt) i przyciskami „wyżej/niżej” – alternatywa bez
 * przeciągania wymagana przez WCAG 2.2 (2.5.7) i wygodniejsza jedną ręką.
 */
export function SortableList<T>({
  items,
  getId,
  getLabel,
  onReorder,
  onCommit,
  renderItem,
}: Props<T>) {
  const move = (index: number, delta: number) => {
    const target = index + delta
    if (target < 0 || target >= items.length) return
    const next = [...items]
    const [item] = next.splice(index, 1)
    next.splice(target, 0, item!)
    onReorder(next)
    onCommit(next)
  }

  return (
    <Reorder.Group
      axis="y"
      values={items}
      onReorder={onReorder}
      className="flex flex-col border-t border-line"
    >
      {items.map((item, index) => (
        <Row
          key={getId(item)}
          item={item}
          label={getLabel(item)}
          first={index === 0}
          last={index === items.length - 1}
          onUp={() => move(index, -1)}
          onDown={() => move(index, 1)}
          onDragEnd={() => onCommit(items)}
        >
          {renderItem(item)}
        </Row>
      ))}
    </Reorder.Group>
  )
}

type RowProps<T> = {
  item: T
  label: string
  first: boolean
  last: boolean
  onUp: () => void
  onDown: () => void
  onDragEnd: () => void
  children: ReactNode
}

function Row<T>({ item, label, first, last, onUp, onDown, onDragEnd, children }: RowProps<T>) {
  const controls = useDragControls()
  const reduced = useReducedMotion()
  return (
    <Reorder.Item
      value={item}
      dragListener={false}
      dragControls={controls}
      onDragEnd={onDragEnd}
      layout={reduced ? undefined : 'position'}
      className="flex items-center gap-2 border-b border-line bg-bg py-2"
    >
      <button
        type="button"
        aria-hidden="true"
        tabIndex={-1}
        onPointerDown={(event) => controls.start(event)}
        className="flex size-11 shrink-0 cursor-grab touch-none items-center justify-center text-text-muted active:cursor-grabbing"
      >
        <Icon icon={GripVertical} className="size-5" />
      </button>
      <div className="min-w-0 flex-1">{children}</div>
      <div className="flex shrink-0">
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label={`Przesuń wyżej: ${label}`}
          disabled={first}
          onClick={onUp}
        >
          <Icon icon={ArrowUp} />
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label={`Przesuń niżej: ${label}`}
          disabled={last}
          onClick={onDown}
        >
          <Icon icon={ArrowDown} />
        </Button>
      </div>
    </Reorder.Item>
  )
}
