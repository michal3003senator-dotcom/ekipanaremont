/** Formaty zdjęć przyjmowane z przeglądarki (treść i tak sprawdza sharp w Payload). */
export const UPLOAD_IMAGE_TYPES: ReadonlySet<string> = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/avif',
])

/** Najdłuższy bok zdjęcia wysyłanego z przeglądarki (Payload i tak koduje do 2400 px). */
export const UPLOAD_MAX_SIDE = 2400

/** Wymiary po zmniejszeniu do `max` po dłuższym boku, bez powiększania. */
export function fitWithin(width: number, height: number, max = UPLOAD_MAX_SIDE) {
  const scale = Math.min(1, max / Math.max(width, height))
  return {
    width: Math.max(1, Math.round(width * scale)),
    height: Math.max(1, Math.round(height * scale)),
  }
}

/**
 * Zmniejszenie zdjęcia w przeglądarce do WebP (SPEC 3.4) – szybsza wysyłka z budowy.
 * Orientacja z EXIF jest uwzględniana, metadane nie przechodzą (canvas ich nie kopiuje).
 * Gdy przeglądarka nie odczyta formatu, wysyłamy oryginał – serwer i tak go sprawdzi.
 */
export async function compressImage(file: File, maxSide = UPLOAD_MAX_SIDE): Promise<File> {
  try {
    const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' })
    const { width, height } = fitWithin(bitmap.width, bitmap.height, maxSide)
    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    canvas.getContext('2d')?.drawImage(bitmap, 0, 0, width, height)
    bitmap.close()
    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, 'image/webp', 0.85),
    )
    if (!blob || blob.type !== 'image/webp') return file
    return new File([blob], file.name.replace(/\.\w+$/, '') + '.webp', { type: 'image/webp' })
  } catch {
    return file
  }
}
