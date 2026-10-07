'use client'

import { Phone } from 'lucide-react'
import { useEffect, useRef, useState, useTransition } from 'react'
import { revealPhoneAction } from '@/app/(frontend)/(serwis)/firma/[slug]/actions'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { toast } from '@/components/ui/Toast'
import { formatPhone } from '@/lib/format/number'

type Props = { slug: string; hasPhone: boolean }

/** Główne akcje profilu: przejście do formularza zapytania i „Pokaż numer telefonu” (zliczane). */
export function ProfileActions({ slug, hasPhone }: Props) {
  const [phone, setPhone] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()
  const root = useRef<HTMLDivElement>(null)

  // Na telefonie pasek z akcjami chowa się, gdy formularz zapytania jest już na ekranie.
  useEffect(() => {
    const bar = root.current?.closest('aside')
    const form = document.getElementById('zapytanie')?.closest('section')
    if (!bar || !form) return
    const observer = new IntersectionObserver(([entry]) =>
      bar.toggleAttribute('data-covered', entry?.isIntersecting ?? false),
    )
    observer.observe(form)
    return () => observer.disconnect()
  }, [])

  const reveal = () =>
    startTransition(async () => {
      const result = await revealPhoneAction(slug)
      if (result.ok) setPhone(result.phone)
      else toast({ title: result.message, tone: 'danger' })
    })

  const phoneButton = phone ? (
    <Button asChild variant="secondary" className="max-lg:flex-1 lg:w-full">
      <a href={`tel:${phone.replace(/[^\d+]/g, '')}`}>
        <Icon icon={Phone} />
        <span className="font-data">{formatPhone(phone)}</span>
      </a>
    </Button>
  ) : (
    <>
      <Button
        variant="secondary"
        size="icon"
        aria-label="Pokaż numer telefonu"
        onClick={reveal}
        disabled={pending}
        className="lg:hidden"
      >
        <Icon icon={Phone} />
      </Button>
      <Button
        variant="secondary"
        onClick={reveal}
        disabled={pending}
        className="hidden lg:inline-flex lg:w-full"
      >
        <Icon icon={Phone} />
        Pokaż numer telefonu
      </Button>
    </>
  )

  return (
    <div ref={root} className="contents">
      <Button asChild variant="primary" className="max-lg:flex-1 lg:w-full">
        <a href="#zapytanie">Wyślij zapytanie</a>
      </Button>
      {hasPhone && phoneButton}
    </div>
  )
}
