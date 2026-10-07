'use client'

import { Camera, ImagePlus, Trash2 } from 'lucide-react'
import { useRef, useState, useTransition } from 'react'

import { SortableList } from '@/components/features/sortable/SortableList'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { toast } from '@/components/ui/Toast'
import { compressImage } from '@/lib/images'
import { MAX_PROJECT_PHOTOS } from '@/lib/panel/profile'

import { removeProjectPhotoAction, reorderPhotosAction, uploadProjectPhotoAction } from './actions'

export type Photo = { id: string; url: string | null; alt: string }

/**
 * Zdjęcia realizacji (SPEC 3.4): aparat albo galeria, wiele naraz, zmniejszane w przeglądarce,
 * wysyłane po jednym (postęp widać na bieżąco), kolejność przeciąganiem lub strzałkami.
 */
export function PhotoManager({ projectId, initial }: { projectId: string; initial: Photo[] }) {
  const [photos, setPhotos] = useState(initial)
  const [uploading, setUploading] = useState<{ done: number; total: number } | null>(null)
  const [, startTransition] = useTransition()
  const camera = useRef<HTMLInputElement>(null)
  const gallery = useRef<HTMLInputElement>(null)
  const free = MAX_PROJECT_PHOTOS - photos.length

  async function upload(files: FileList | null) {
    const selected = Array.from(files ?? []).slice(0, free)
    if (!selected.length) return
    setUploading({ done: 0, total: selected.length })
    let failed = 0
    for (const [index, file] of selected.entries()) {
      const data = new FormData()
      data.set('projectId', projectId)
      data.set('file', await compressImage(file))
      const result = await uploadProjectPhotoAction(data)
      if (result.ok && result.data)
        setPhotos((current) => [
          ...current,
          { id: result.data!.id, url: result.data!.url, alt: file.name },
        ])
      else failed += 1
      setUploading({ done: index + 1, total: selected.length })
    }
    setUploading(null)
    if (failed)
      toast({
        title: 'Nie wszystkie zdjęcia dodane',
        description: `Nie udało się dodać ${failed} z ${selected.length}. Sprawdź format (JPG, PNG, WebP).`,
        tone: 'danger',
      })
    else toast({ title: selected.length === 1 ? 'Zdjęcie dodane' : 'Zdjęcia dodane' })
  }

  const remove = (photo: Photo) =>
    startTransition(async () => {
      setPhotos((current) => current.filter((item) => item.id !== photo.id))
      const result = await removeProjectPhotoAction({ projectId, mediaId: photo.id })
      if (!result.ok) {
        setPhotos((current) => [...current, photo])
        toast({ title: 'Zdjęcie nieusunięte', description: result.message, tone: 'danger' })
      }
    })

  const commit = (items: Photo[]) =>
    startTransition(async () => {
      const result = await reorderPhotosAction({ projectId, ids: items.map((item) => item.id) })
      if (!result.ok)
        toast({ title: 'Kolejność niezapisana', description: result.message, tone: 'danger' })
    })

  return (
    <div className="flex flex-col gap-5">
      <div className="grid gap-3 sm:grid-cols-2">
        <Button
          variant="primary"
          disabled={free <= 0 || Boolean(uploading)}
          onClick={() => camera.current?.click()}
          className="sm:hidden"
        >
          <Icon icon={Camera} />
          Robię zdjęcie
        </Button>
        <Button
          variant="secondary"
          disabled={free <= 0 || Boolean(uploading)}
          onClick={() => gallery.current?.click()}
        >
          <Icon icon={ImagePlus} />
          Dodaję z galerii
        </Button>
      </div>
      <input
        ref={camera}
        type="file"
        accept="image/*"
        capture="environment"
        className="sr-only"
        tabIndex={-1}
        onChange={(event) =>
          void upload(event.target.files).finally(() => (event.target.value = ''))
        }
      />
      <input
        ref={gallery}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/avif,image/heic"
        multiple
        className="sr-only"
        tabIndex={-1}
        onChange={(event) =>
          void upload(event.target.files).finally(() => (event.target.value = ''))
        }
      />
      <p className="text-small text-text-muted" aria-live="polite">
        {uploading
          ? `Wysyłam ${Math.min(uploading.done + 1, uploading.total)} z ${uploading.total}…`
          : `${photos.length} z ${MAX_PROJECT_PHOTOS} zdjęć. Pierwsze jest okładką realizacji.`}
      </p>
      {photos.length > 0 && (
        <SortableList
          items={photos}
          getId={(photo) => photo.id}
          getLabel={(photo) => `zdjęcie ${photos.indexOf(photo) + 1}`}
          onReorder={setPhotos}
          onCommit={commit}
          renderItem={(photo) => (
            <div className="flex items-center gap-3">
              {photo.url ? (
                // eslint-disable-next-line @next/next/no-img-element -- miniatura już przeskalowana przez Payload (WebP 480 px)
                <img
                  src={photo.url}
                  alt=""
                  width={96}
                  height={72}
                  className="aspect-4/3 w-24 rounded-badge object-cover"
                />
              ) : (
                <span className="aspect-4/3 w-24 rounded-badge bg-surface-2" />
              )}
              <span className="text-small text-text-muted">
                Zdjęcie {photos.indexOf(photo) + 1}
              </span>
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label={`Usuń zdjęcie ${photos.indexOf(photo) + 1}`}
                onClick={() => remove(photo)}
                className="ms-auto"
              >
                <Icon icon={Trash2} />
              </Button>
            </div>
          )}
        />
      )}
    </div>
  )
}
