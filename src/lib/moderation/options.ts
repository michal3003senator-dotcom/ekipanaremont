/**
 * Słowniki moderacji (SPEC 3.11, 3.13) wspólne dla kolekcji, formularzy i centrum moderacji.
 * Bez importów serwerowych – używane także w przeglądarce.
 */
export const REPORT_TARGETS = {
  firms: 'Profil firmy',
  reviews: 'Opinia',
  forumThreads: 'Wątek forum',
  forumPosts: 'Post forum',
  listings: 'Ogłoszenie',
  articles: 'Artykuł',
} as const

export type ReportTarget = keyof typeof REPORT_TARGETS

/** Treści, które gość może dziś zgłosić (forum i giełda dojdą z modułami). */
export const PUBLIC_TARGETS = ['firms', 'reviews', 'articles'] as const satisfies ReportTarget[]
export type PublicTarget = (typeof PUBLIC_TARGETS)[number]

/** Powody widoczne w formularzu zgłoszenia. */
export const PUBLIC_REASONS = {
  illegal: 'Treść niezgodna z prawem',
  fake: 'Fałszywa opinia lub dane',
  offensive: 'Treść obraźliwa',
  spam: 'Spam lub reklama',
  theft: 'Podejrzenie kradzieży',
  other: 'Inny powód',
} as const

/** Wszystkie powody: także decyzje z urzędu i odwołania (rejestr decyzji DSA). */
export const REPORT_REASONS = {
  ...PUBLIC_REASONS,
  moderator: 'Kontrola moderatora',
  appeal: 'Odwołanie od decyzji',
} as const

export type ReportReason = keyof typeof REPORT_REASONS

export const REPORT_DECISIONS = {
  none: 'Bez zmian',
  hidden: 'Ukryto',
  removed: 'Usunięto',
  warned: 'Ostrzeżenie',
  banned: 'Blokada',
} as const

export type ReportDecision = keyof typeof REPORT_DECISIONS

export const SANCTION_SCOPES = {
  forum: 'Forum',
  marketplace: 'Giełda',
  account: 'Całe konto',
} as const

export type SanctionScope = keyof typeof SANCTION_SCOPES

export const SANCTION_TYPES = { warning: 'Ostrzeżenie', ban: 'Blokada' } as const
export type SanctionType = keyof typeof SANCTION_TYPES

/** Zakładki centrum moderacji (adres `?k=`). */
export const QUEUE_TABS = {
  firmy: 'Profile',
  opinie: 'Opinie',
  zgloszenia: 'Zgłoszenia',
} as const

export type QueueTab = keyof typeof QUEUE_TABS
