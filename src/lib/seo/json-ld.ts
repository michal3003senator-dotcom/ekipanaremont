/**
 * JSON-LD do `<script type="application/ld+json">`: `<` zamieniony na `<`, więc treść
 * od użytkownika (nazwa, opis) nie zamknie znacznika (dokumentacja Next.js, „JSON-LD”).
 */
export const serializeJsonLd = (data: unknown) => JSON.stringify(data).replace(/</g, '\\u003c')
