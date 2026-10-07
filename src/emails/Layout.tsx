import {
  Body,
  Button,
  Container,
  Head,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from '@react-email/components'
import type { ReactNode } from 'react'

import { emailTheme as t } from './theme'

type LayoutProps = { preview: string; heading: string; children: ReactNode }

/** Wspólny układ e-maili: jedna kolumna 560 px, nagłówek z nazwą serwisu, stopka z informacją. */
export function EmailLayout({ preview, heading, children }: LayoutProps) {
  return (
    <Html lang="pl">
      <Head />
      <Preview>{preview}</Preview>
      <Body style={{ backgroundColor: t.bg, fontFamily: t.font, margin: 0, padding: '24px 0' }}>
        <Container
          style={{
            maxWidth: 560,
            backgroundColor: t.surface,
            border: `1px solid ${t.line}`,
            borderRadius: 18,
            padding: 32,
          }}
        >
          <Text
            style={{
              margin: 0,
              fontSize: 14,
              fontWeight: 700,
              color: t.accent,
              letterSpacing: '0.02em',
            }}
          >
            Ekipa na Termin
          </Text>
          <Text
            style={{
              margin: '24px 0 8px',
              fontSize: 24,
              lineHeight: '30px',
              fontWeight: 700,
              color: t.text,
            }}
          >
            {heading}
          </Text>
          {children}
          <Hr style={{ borderColor: t.line, margin: '32px 0 16px' }} />
          <Text style={{ margin: 0, fontSize: 12, lineHeight: '18px', color: t.muted }}>
            Wiadomość z serwisu ekipanatermin.pl. Platforma łączy klientów z firmami remontowymi i
            nie jest stroną umów między nimi.
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

export function Paragraph({ children }: { children: ReactNode }) {
  return (
    <Text style={{ margin: '0 0 16px', fontSize: 16, lineHeight: '24px', color: t.text }}>
      {children}
    </Text>
  )
}

export function Note({ children }: { children: ReactNode }) {
  return (
    <Text style={{ margin: '16px 0 0', fontSize: 14, lineHeight: '20px', color: t.muted }}>
      {children}
    </Text>
  )
}

/** Główna akcja e-maila; ten sam czasownik co w serwisie (DESIGN §8). */
export function Action({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Section style={{ margin: '8px 0 8px' }}>
      <Button
        href={href}
        style={{
          backgroundColor: t.accent,
          color: t.onAccent,
          borderRadius: 12,
          padding: '14px 24px',
          fontSize: 16,
          fontWeight: 700,
          textDecoration: 'none',
        }}
      >
        {children}
      </Button>
    </Section>
  )
}
