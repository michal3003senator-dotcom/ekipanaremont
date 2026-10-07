'use client'

import { Moon, Sun } from 'lucide-react'
import { useState, useTransition } from 'react'

import { Icon } from '@/components/ui/Icon'
import { cn } from '@/lib/cn'
import { type Theme, themeAttribute } from '@/lib/theme'
import { setTheme } from '@/lib/theme/set-theme'

type Props = { initialTheme: Theme; className?: string }

/** Przełącza motyw od razu na stronie i zapisuje wybór w ciasteczku. */
export function ThemeSwitch({ initialTheme, className }: Props) {
  const [theme, setLocalTheme] = useState(initialTheme)
  const [, startTransition] = useTransition()
  const isLight = theme === 'jasny'

  function toggle() {
    const next: Theme = isLight ? 'ciemny' : 'jasny'
    setLocalTheme(next)
    const attribute = themeAttribute(next)
    if (attribute) document.documentElement.dataset.theme = attribute
    else delete document.documentElement.dataset.theme
    startTransition(async () => {
      await setTheme(next)
    })
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={isLight}
      className={cn(
        'inline-flex size-11 cursor-pointer items-center justify-center rounded-control text-text-muted transition-colors duration-150 hover:bg-surface-2 hover:text-text',
        className,
      )}
    >
      <Icon icon={isLight ? Sun : Moon} />
      <span className="sr-only">Jasny motyw</span>
    </button>
  )
}
