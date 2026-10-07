import { RichText } from '@payloadcms/richtext-lexical/react'
import { ShieldCheck } from 'lucide-react'
import type { Metadata } from 'next'
import { headers } from 'next/headers'
import { notFound } from 'next/navigation'
import type { ReactNode } from 'react'

import { FirmCard } from '@/components/features/firm/FirmCard'
import { FirmProfileHeader } from '@/components/features/firm/FirmProfileHeader'
import { ProfileActions } from '@/components/features/firm/ProfileActions'
import { ProjectGallery } from '@/components/features/firm/ProjectGallery'
import { RatingSummary, ReviewList } from '@/components/features/firm/ReviewList'
import { ViewBeacon } from '@/components/features/firm/ViewBeacon'
import { Breadcrumbs } from '@/components/ui/Breadcrumbs'
import { Icon } from '@/components/ui/Icon'
import { getFirmProfile, type FirmProfile } from '@/lib/firm/profile'
import { formatInstantDate } from '@/lib/format/date'
import { formatCount } from '@/lib/format/number'
import { searchFirms } from '@/lib/search/firms'
import { publicContext } from '@/lib/search/context'
import { searchHref } from '@/lib/search/params'
import { loadFirmSummaries } from '@/lib/search/summary'
import { serializeJsonLd } from '@/lib/seo/json-ld'

import { InquiryForm } from './InquiryForm'

type Props = { params: Promise<{ slug: string }> }

const REGISTRY_NAME = { CEIDG: 'CEIDG', KRS: 'KRS', VAT: 'Białej liście VAT' } as const

async function profileFor(params: Props['params']) {
  const { slug } = await params
  const context = await publicContext()
  const profile = await getFirmProfile(context.payload, slug, context.today, context.expiryDays)
  return { ...context, profile }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { profile } = await profileFor(params)
  if (!profile) return { title: 'Nie znaleźliśmy firmy – Ekipa na Termin' }
  const { summary } = profile
  const description =
    profile.shortDescription ??
    `${summary.name}: ${summary.services}, ${summary.locality}. Najbliższy wolny termin, realizacje i opinie.`
  return {
    title: `${summary.name} – ${summary.services}, ${summary.locality} – Ekipa na Termin`,
    description: description.slice(0, 170),
    alternates: { canonical: `/firma/${summary.slug}` },
    openGraph: { type: 'profile', title: summary.name, description, locale: 'pl_PL' },
  }
}

/** LocalBusiness i AggregateRating (SPEC 3.2) – bez telefonu, który pokazujemy na żądanie. */
function jsonLd(profile: FirmProfile, url: string) {
  const { summary } = profile
  return {
    '@context': 'https://schema.org',
    '@type': 'HomeAndConstructionBusiness',
    name: summary.name,
    url,
    description: profile.shortDescription ?? undefined,
    image: typeof summary.photo?.src === 'string' ? summary.photo.src : undefined,
    address: profile.baseLocality
      ? {
          '@type': 'PostalAddress',
          addressLocality: profile.baseLocality.name,
          addressRegion: 'łódzkie',
          addressCountry: 'PL',
        }
      : undefined,
    areaServed: profile.serviceArea.map((name) => ({ '@type': 'City', name })),
    taxID: profile.nip,
    aggregateRating:
      summary.rating !== null && summary.reviews > 0
        ? {
            '@type': 'AggregateRating',
            ratingValue: summary.rating,
            reviewCount: summary.reviews,
            bestRating: 5,
            worstRating: 1,
          }
        : undefined,
  }
}

function Section({
  id,
  title,
  count,
  children,
}: {
  id: string
  title: string
  count?: number
  children: ReactNode
}) {
  return (
    <section aria-labelledby={id} className="scroll-mt-24 border-t border-line pt-8">
      <h2 id={id} className="font-display text-h2 font-medium">
        {title}
        {count !== undefined && (
          <span className="ms-2 font-data text-h3 text-text-muted">{count}</span>
        )}
      </h2>
      <div className="mt-6">{children}</div>
    </section>
  )
}

function Facts({ profile }: { profile: FirmProfile }) {
  const rows = [
    profile.yearsExperience !== null && [
      'Doświadczenie',
      formatCount(profile.yearsExperience, { one: 'rok', few: 'lata', many: 'lat' }),
    ],
    profile.teamSize !== null && [
      'Ekipa',
      formatCount(profile.teamSize, { one: 'osoba', few: 'osoby', many: 'osób' }),
    ],
    profile.warrantyMonths && [
      'Gwarancja',
      formatCount(profile.warrantyMonths, { one: 'miesiąc', few: 'miesiące', many: 'miesięcy' }),
    ],
    profile.vatInvoice && ['Faktura VAT', 'Wystawia'],
    profile.serviceArea.length > 0 && ['Obszar działania', profile.serviceArea.join(', ')],
  ].filter((row): row is [string, string] => Array.isArray(row))
  return (
    <dl className="grid gap-x-6 gap-y-3 sm:grid-cols-3">
      {rows.map(([label, value]) => (
        <div key={label} className="contents">
          <dt className="text-small text-text-muted sm:pt-0.5">{label}</dt>
          <dd className="text-body sm:col-span-2">{value}</dd>
        </div>
      ))}
    </dl>
  )
}

export default async function FirmProfilePage({ params }: Props) {
  const { payload, today, expiryDays, profile } = await profileFor(params)
  if (!profile) notFound()
  const { summary } = profile
  const nonce = (await headers()).get('x-nonce') ?? undefined

  const similar = profile.mainServiceIds.length
    ? await searchFirms(payload, {
        today,
        expiryDays,
        serviceIds: profile.mainServiceIds,
        localityId: profile.baseLocality?.id,
        radiusKm: 25,
        excludeId: profile.id,
        limit: 3,
      }).then(({ ids }) => loadFirmSummaries(payload, ids, today, expiryDays))
    : []
  const url = new URL(
    `/firma/${summary.slug}`,
    process.env.NEXT_PUBLIC_SERVER_URL ?? 'http://localhost:3000',
  ).toString()

  return (
    <div className="mx-auto flex max-w-page flex-col gap-8 px-4 py-8 max-lg:pb-40 md:px-6 md:py-12">
      <script
        type="application/ld+json"
        // Bezpieczne: serializeJsonLd zamienia „<” na <, dane nie zamkną znacznika.
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLd(profile, url)) }}
      />
      <ViewBeacon slug={summary.slug} />
      <Breadcrumbs
        items={[
          { label: 'Firmy', href: '/szukaj' },
          ...(profile.baseLocality?.slug
            ? [
                {
                  label: profile.baseLocality.name,
                  href: searchHref({}, { gdzie: profile.baseLocality.slug }),
                },
              ]
            : []),
          { label: summary.name },
        ]}
      />
      <FirmProfileHeader
        firm={summary}
        today={today}
        logo={profile.logo}
        lead={profile.shortDescription}
        actions={<ProfileActions slug={summary.slug} hasPhone={profile.hasPhone} />}
      >
        <div className="mt-10 flex flex-col gap-10">
          {profile.gallery.length > 0 && (
            <Section id="realizacje" title="Realizacje" count={profile.gallery.length}>
              <ProjectGallery projects={profile.gallery} />
            </Section>
          )}

          {profile.services.length > 0 && (
            <Section id="uslugi" title="Usługi">
              <ul className="grid gap-4 sm:grid-cols-2">
                {profile.services.map((service) => (
                  <li key={service.id} className="flex flex-col gap-1">
                    <p className="font-medium">{service.name}</p>
                    {service.children.length > 0 && (
                      <p className="text-small text-text-muted">{service.children.join(', ')}</p>
                    )}
                  </li>
                ))}
              </ul>
            </Section>
          )}

          <Section id="opinie" title="Opinie" count={summary.reviews}>
            {summary.rating !== null && profile.reviews.length > 0 ? (
              <div className="flex flex-col gap-8">
                <RatingSummary average={summary.rating} distribution={profile.distribution} />
                <ReviewList reviews={profile.reviews} />
              </div>
            ) : (
              <p className="max-w-prose text-body text-text-muted">
                Jeszcze nie ma opinii. Opinię wystawia tylko klient, który wysłał zapytanie przez
                serwis, a moderator sprawdza ją przed publikacją.
              </p>
            )}
          </Section>

          <Section id="o-firmie" title="O firmie">
            <div className="flex flex-col gap-6">
              {profile.about && (
                <RichText data={profile.about} className="rich-text max-w-prose text-body" />
              )}
              <Facts profile={profile} />
              {profile.website && (
                <p className="text-body">
                  <a
                    href={profile.website}
                    rel="nofollow noopener noreferrer"
                    target="_blank"
                    className="text-accent-soft underline underline-offset-4"
                  >
                    Strona internetowa firmy
                  </a>
                </p>
              )}
            </div>
          </Section>

          <Section id="rejestr" title="Dane z rejestru">
            <p className="flex max-w-prose items-start gap-3 text-body">
              <Icon icon={ShieldCheck} className="mt-1 shrink-0 text-success" />
              <span>
                NIP <span className="font-data">{profile.nip}</span>
                {summary.registry
                  ? ` – firma w rejestrze ${REGISTRY_NAME[summary.registry]}`
                  : ' – dane sprawdził moderator'}
                {profile.registryVerifiedAt &&
                  ` (${formatInstantDate(profile.registryVerifiedAt)})`}
                .
              </span>
            </p>
          </Section>

          <Section id="zapytanie" title="Wyślij zapytanie">
            <div className="flex flex-col gap-6">
              <p className="max-w-prose text-body text-text-muted">
                Bez rejestracji i opłat. {summary.name} odpowie telefonicznie albo e-mailem.
              </p>
              <InquiryForm
                firmSlug={summary.slug}
                firmName={summary.name}
                services={profile.serviceOptions}
                siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY}
                nonce={nonce}
              />
            </div>
          </Section>

          {similar.length > 0 && (
            <Section id="podobne" title="Podobne firmy">
              <ul className="grid gap-4 md:grid-cols-2">
                {similar.map((firm) => (
                  <li key={firm.slug}>
                    <FirmCard firm={firm} today={today} />
                  </li>
                ))}
              </ul>
            </Section>
          )}
        </div>
      </FirmProfileHeader>
    </div>
  )
}
