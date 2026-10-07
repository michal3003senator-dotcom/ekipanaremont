import Link from 'next/link'

import { LivePreviewRefresh } from './LivePreviewRefresh'

/** Tryb podglądu (redakcja): pasek z wyjściem i odświeżanie po zapisie w panelu (ADR 0023). */
export function PreviewBar({ path }: { path: string }) {
  return (
    <>
      <LivePreviewRefresh />
      <p className="flex flex-wrap items-center justify-between gap-2 rounded-control border border-line bg-surface-2 px-4 py-2 text-small">
        <span>Podgląd: widzisz najnowszy szkic, także nieopublikowany.</span>
        <Link
          href={`/podglad?wyjdz=1&sciezka=${encodeURIComponent(path)}`}
          prefetch={false}
          className="font-medium underline underline-offset-4"
        >
          Wyjdź z podglądu
        </Link>
      </p>
    </>
  )
}
