import { PhotoGallery } from '@/components/features/firm/ProjectGallery'
import type { GalleryItem } from '@/components/features/firm/types'
import { mediaPhoto } from '@/lib/search/summary'
import type { Media } from '@/payload-types'

/** Galeria w artykule – ta sama co realizacje firm, podpis z opisu zdjęcia. */
export function GalleryBlock({ images }: { images?: readonly unknown[] | null }) {
  const items = (images ?? [])
    .map((image): GalleryItem | null => {
      const photo = mediaPhoto(image)
      return photo ? { id: (image as Media).id, photo, caption: photo.alt } : null
    })
    .filter((item): item is GalleryItem => item !== null)
  return items.length ? <PhotoGallery items={items} /> : null
}
