import { readFile } from 'node:fs/promises'
import { join } from 'node:path'

import { ImageResponse } from 'next/og'

import { type Availability, buildTiles } from '@/components/features/availability-tiles/model'
import { emailTheme as t } from '@/emails/theme'
import type { CalendarDate } from '@/lib/format/date'

export const OG_SIZE = { width: 1200, height: 630 }

/** Archivo SemiBold z repozytorium (OFL, `assets/fonts`) – bez pobierania fontów w czasie działania. */
async function fonts() {
  const data = await readFile(join(process.cwd(), 'assets/fonts/Archivo-SemiBold.ttf'))
  return [{ name: 'Archivo', data, weight: 600 as const, style: 'normal' as const }]
}

type Props = {
  eyebrow: string
  title: string
  subtitle: string
  today: CalendarDate
  availability: Availability
  label: string
}

/** Obrazek do udostępniania w stylu kafla terminu: tytuł, podpis i 14 kafli od dziś. */
export async function ogImage({ eyebrow, title, subtitle, today, availability, label }: Props) {
  const tiles = buildTiles(today, availability)
  return new ImageResponse(
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        width: '100%',
        height: '100%',
        padding: 72,
        background: t.bg,
        color: t.text,
        fontFamily: 'Archivo',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div style={{ display: 'flex', fontSize: 28, color: t.muted }}>{eyebrow}</div>
        <div style={{ display: 'flex', fontSize: 68, lineHeight: 1.05, maxWidth: 1000 }}>
          {title}
        </div>
        <div style={{ display: 'flex', fontSize: 32, color: t.muted }}>{subtitle}</div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div style={{ display: 'flex', fontSize: 34, color: t.accent }}>{label}</div>
        <div style={{ display: 'flex', gap: 10 }}>
          {tiles.map((tile) => (
            <div
              key={tile.date}
              style={{
                width: 64,
                height: 64,
                marginLeft: tile.weekStart ? 14 : 0,
                borderRadius: 10,
                background: tile.kind === 'free' || tile.kind === 'open' ? t.accent : t.tile,
              }}
            />
          ))}
        </div>
      </div>
    </div>,
    { ...OG_SIZE, fonts: await fonts() },
  )
}
