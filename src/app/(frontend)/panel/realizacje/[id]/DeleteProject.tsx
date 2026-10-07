'use client'

import { useRouter } from 'next/navigation'
import { useTransition } from 'react'

import { Button } from '@/components/ui/Button'
import { toast } from '@/components/ui/Toast'

import { deleteProjectAction } from '../actions'

export function DeleteProject({ id }: { id: string }) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  return (
    <Button
      variant="danger"
      loading={pending}
      className="self-start max-sm:w-full"
      onClick={() => {
        if (!window.confirm('Usunąć realizację razem ze zdjęciami? Tego nie da się cofnąć.')) return
        startTransition(async () => {
          const result = await deleteProjectAction({ id })
          if (result.ok) {
            toast({ title: 'Realizacja usunięta' })
            router.replace('/panel/realizacje')
          } else
            toast({ title: 'Realizacja nieusunięta', description: result.message, tone: 'danger' })
        })
      }}
    >
      Usuwam realizację
    </Button>
  )
}
