export type RegistrySource = 'ceidg' | 'krs' | 'vat'

/** Dane firmy z rejestru: tylko jawne dane rejestrowe potrzebne do profilu i weryfikacji. */
export type RegistryRecord = {
  source: RegistrySource
  nip: string
  name: string
  address: string | null
  /** Firma aktywna w rejestrze (CEIDG: aktywna, VAT: czynny lub zwolniony, KRS: wpis bez wykreślenia). */
  active: boolean
  regon: string | null
  krs: string | null
  checkedAt: string
}

export type LookupResult =
  | { status: 'found'; record: RegistryRecord }
  | { status: 'not_found' }
  /** Żaden rejestr nie odpowiedział – profil czeka na ręczną weryfikację moderatora. */
  | { status: 'unavailable' }

export type Fetch = typeof fetch
