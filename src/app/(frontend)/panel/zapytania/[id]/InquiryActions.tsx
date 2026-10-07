'use client'

import { Mail, Phone } from 'lucide-react'
import { useOptimistic, useTransition } from 'react'

import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { toast } from '@/components/ui/Toast'
import type { Inquiry } from '@/payload-types'

import { setInquiryStatusAction } from '../../actions'
import { INQUIRY_STATUS } from '../status'

type Props = {
  id: string
  status: Inquiry['status']
  phone?: string | null
  email: string
  subject: string
}

/** Szybkie akcje (SPEC 3.4): zadzwoń, napisz, zmiana statusu bez przeładowania. */
export function InquiryActions({ id, status, phone, email, subject }: Props) {
  const [current, setCurrent] = useOptimistic(status)
  const [pending, startTransition] = useTransition()
  const change = (next: Inquiry['status']) =>
    startTransition(async () => {
      setCurrent(next)
      const result = await setInquiryStatusAction({ id, status: next })
      if (!result.ok)
        toast({ title: 'Status niezmieniony', description: result.message, tone: 'danger' })
    })

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-3 sm:grid-cols-2">
        {phone && (
          <Button asChild variant="primary">
            <a
              href={`tel:${phone.replace(/\s/g, '')}`}
              onClick={() => current === 'new' && change('in_contact')}
            >
              <Icon icon={Phone} />
              Dzwonię
            </a>
          </Button>
        )}
        <Button asChild variant={phone ? 'secondary' : 'primary'}>
          <a
            href={`mailto:${email}?subject=${encodeURIComponent(subject)}`}
            onClick={() => current === 'new' && change('in_contact')}
          >
            <Icon icon={Mail} />
            Piszę e-mail
          </a>
        </Button>
      </div>
      <fieldset className="flex flex-col gap-2">
        <legend className="mb-2 text-small text-text-muted">Status</legend>
        <div className="flex flex-wrap gap-2">
          {(Object.keys(INQUIRY_STATUS) as Inquiry['status'][]).map((value) => (
            <button
              key={value}
              type="button"
              aria-pressed={current === value}
              disabled={pending && current === value}
              onClick={() => change(value)}
              className="h-11 rounded-control border border-line-strong px-4 text-small transition-colors duration-150 hover:border-text-muted aria-pressed:border-text aria-pressed:bg-text aria-pressed:text-bg"
            >
              {INQUIRY_STATUS[value]}
            </button>
          ))}
        </div>
      </fieldset>
    </div>
  )
}
