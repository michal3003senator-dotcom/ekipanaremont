'use client'

import * as Sentry from '@sentry/nextjs'
import { useEffect } from 'react'

export default function GlobalError({ error }: { error: Error & { digest?: string } }) {
  useEffect(() => {
    Sentry.captureException(error)
  }, [error])

  return (
    <html lang="pl">
      <body>
        <main>
          <h1>Coś poszło nie tak</h1>
          <p>Spróbuj odświeżyć stronę za chwilę.</p>
        </main>
      </body>
    </html>
  )
}
