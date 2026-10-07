'use client'

import { useTransition } from 'react'

import { Button } from '@/components/ui/Button'
import { toast } from '@/components/ui/Toast'

import { submitForReviewAction } from '../actions'

export function SubmitForReview({ disabled }: { disabled?: boolean }) {
  const [pending, startTransition] = useTransition()
  return (
    <Button
      variant="primary"
      disabled={disabled}
      loading={pending}
      className="self-start max-sm:w-full"
      onClick={() =>
        startTransition(async () => {
          const result = await submitForReviewAction()
          toast(
            result.ok
              ? { title: 'Profil wysłany do akceptacji' }
              : { title: 'Profil niewysłany', description: result.message, tone: 'danger' },
          )
        })
      }
    >
      Wysyłam profil do akceptacji
    </Button>
  )
}
