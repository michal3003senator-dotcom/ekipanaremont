'use client'

import Script from 'next/script'
import { useEffect, useRef, useState } from 'react'

type TurnstileApi = {
  render: (element: HTMLElement, options: Record<string, unknown>) => string
  remove: (widgetId: string) => void
}

declare global {
  interface Window {
    turnstile?: TurnstileApi
  }
}

type Props = {
  siteKey: string | undefined
  nonce: string | undefined
  onToken: (token: string | undefined) => void
}

/** Widżet Cloudflare Turnstile (renderowany jawnie, polski, motyw z systemu). Bez klucza – nic. */
export function Turnstile({ siteKey, nonce, onToken }: Props) {
  const container = useRef<HTMLDivElement>(null)
  const [loaded, setLoaded] = useState(
    () => typeof window !== 'undefined' && Boolean(window.turnstile),
  )

  useEffect(() => {
    if (!siteKey || !loaded || !container.current || !window.turnstile) return
    const id = window.turnstile.render(container.current, {
      sitekey: siteKey,
      language: 'pl',
      theme: 'auto',
      size: 'flexible',
      callback: (token: string) => onToken(token),
      'expired-callback': () => onToken(undefined),
      'error-callback': () => onToken(undefined),
    })
    return () => window.turnstile?.remove(id)
  }, [siteKey, loaded, onToken])

  if (!siteKey) return null
  return (
    <>
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
        nonce={nonce}
        strategy="afterInteractive"
        onReady={() => setLoaded(true)}
      />
      <div ref={container} className="min-h-16" />
    </>
  )
}
