import { getPayload, type Payload } from 'payload'

import config from '../../payload.config'
import type { FirmAccount, Staff } from '../../payload-types'

export type TestUser =
  | (Staff & { collection: 'staff'; _strategy: string })
  | (FirmAccount & { collection: 'firmAccounts'; _strategy: string })

/** Poprawne NIP-y testowe (suma kontrolna). */
export const NIP = { a: '5260250274', b: '7740001454', c: '1132191233' } as const

const PASSWORD = 'Haslo-testowe-123!'

export type Fixtures = Awaited<ReturnType<typeof createFixtures>>

/**
 * Wspólne dane do testów dostępu: dwie aktywne firmy (A, B), firma zawieszona (C), ich konta
 * i personel w trzech rolach. Personel „po kodzie TOTP” ma `_strategy: 'totp'`, jak po weryfikacji w panelu.
 */
export async function createFixtures() {
  const payload: Payload = await getPayload({ config })
  const system = { overrideAccess: true } as const

  await payload.updateGlobal({
    slug: 'settings',
    data: { featureFlags: { forum: true, marketplace: true, calculators: true } },
    ...system,
  })

  const firm = (name: string, nip: string, status: 'active' | 'suspended') =>
    payload.create({
      collection: 'firms',
      data: {
        name,
        nip,
        status,
        subscriptionStatus: 'trial',
        registryVerifiedAt: new Date().toISOString(),
      },
      ...system,
    })
  const [firmA, firmB, firmC] = await Promise.all([
    firm('Firma A', NIP.a, 'active'),
    firm('Firma B', NIP.b, 'active'),
    firm('Firma C', NIP.c, 'suspended'),
  ])

  const account = async (email: string, firmId: string): Promise<TestUser> => {
    const doc = await payload.create({
      collection: 'firmAccounts',
      data: { email, password: PASSWORD, firm: firmId, _verified: true },
      disableVerificationEmail: true,
      ...system,
    })
    return { ...doc, collection: 'firmAccounts', _strategy: 'local-jwt' }
  }

  const staffMember = async (email: string, role: Staff['role']) => {
    const doc = await payload.create({
      collection: 'staff',
      data: { email, name: role, role, password: PASSWORD },
      ...system,
    })
    return {
      verified: { ...doc, collection: 'staff', _strategy: 'totp' } as TestUser,
      unverified: { ...doc, collection: 'staff', _strategy: 'local-jwt' } as TestUser,
    }
  }

  // Administrator najpierw: pierwsze konto personelu zawsze dostaje rolę admin (hook firstStaffIsAdmin).
  const adminUser = await staffMember('admin@ekipa.test', 'admin')
  const [userA, userB, userC, moderatorUser, editorUser] = await Promise.all([
    account('a@firma.test', firmA.id),
    account('b@firma.test', firmB.id),
    account('c@firma.test', firmC.id),
    staffMember('moderator@ekipa.test', 'moderator'),
    staffMember('editor@ekipa.test', 'editor'),
  ])

  return {
    payload,
    firmA,
    firmB,
    firmC,
    users: {
      a: userA,
      b: userB,
      c: userC,
      admin: adminUser.verified,
      adminWithoutTotp: adminUser.unverified,
      moderator: moderatorUser.verified,
      editor: editorUser.verified,
    },
  }
}

/** Opcje Local API „jak ten użytkownik” (z regułami dostępu). Brak użytkownika = gość. */
export const as = (user?: TestUser) => ({ overrideAccess: false, user }) as const
