'use client'

import dynamic from 'next/dynamic'
import { type ComponentProps, useEffect, useRef, useState } from 'react'

import { Skeleton } from '@/components/ui/Skeleton'

import type { InquiryForm as Form } from './InquiryForm'

type Props = ComponentProps<typeof Form>

function FormSkeleton() {
  return (
    <div aria-hidden="true" className="flex flex-col gap-6">
      {[0, 1, 2, 3].map((row) => (
        <Skeleton key={row} className="h-12 w-full" />
      ))}
      <Skeleton className="h-32 w-full" />
    </div>
  )
}

// Formularz (React Hook Form, Zod, Turnstile) nie obciąża pierwszego wczytania profilu.
const InquiryForm = dynamic(() => import('./InquiryForm').then((module) => module.InquiryForm), {
  ssr: false,
  loading: FormSkeleton,
})

/** Formularz zapytania wczytywany, gdy sekcja zbliża się do ekranu (także po „Wyślij zapytanie”). */
export function LazyInquiryForm(props: Props) {
  const root = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const element = root.current
    if (!element) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return
        setVisible(true)
        observer.disconnect()
      },
      { rootMargin: '800px 0px' },
    )
    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  return <div ref={root}>{visible ? <InquiryForm {...props} /> : <FormSkeleton />}</div>
}
