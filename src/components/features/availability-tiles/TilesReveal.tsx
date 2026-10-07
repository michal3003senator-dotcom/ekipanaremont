'use client'

import { type ComponentProps, useEffect, useRef } from 'react'

/** Uruchamia animację kafli raz, gdy pasek wejdzie w ekran (style: `.tiles` w globals.css). */
export function TilesReveal(props: ComponentProps<'div'>) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const element = ref.current
    if (!element) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return
        element.dataset.played = ''
        observer.disconnect()
      },
      { threshold: 0.6 },
    )
    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  return <div {...props} ref={ref} />
}
