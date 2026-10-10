'use client'

import { Flag } from 'lucide-react'
import dynamic from 'next/dynamic'
import { useState } from 'react'

import { Button } from '@/components/ui/Button'
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/Dialog'
import { Icon } from '@/components/ui/Icon'
import { Skeleton } from '@/components/ui/Skeleton'
import type { PublicTarget } from '@/lib/moderation/options'

// Formularz (React Hook Form, Zod, Turnstile) wczytuje się dopiero po otwarciu okna.
const ReportForm = dynamic(() => import('./ReportForm').then((module) => module.ReportForm), {
  ssr: false,
  loading: () => <Skeleton className="h-80 w-full" />,
})

type Props = { targetType: PublicTarget; targetId: string; label: string; nonce?: string }

/** „Zgłoś” przy treści (SPEC 3.13): dyskretny przycisk, okno z formularzem. */
export function ReportButton({ targetType, targetId, label, nonce }: Props) {
  const [open, setOpen] = useState(false)
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="self-start text-text-muted">
          <Icon icon={Flag} />
          Zgłoś
        </Button>
      </DialogTrigger>
      <DialogContent
        title={`Zgłoś: ${label}`}
        description="Sprawdzimy zgłoszenie i napiszemy, co postanowiliśmy."
      >
        {open && <ReportForm targetType={targetType} targetId={targetId} nonce={nonce} />}
      </DialogContent>
    </Dialog>
  )
}
