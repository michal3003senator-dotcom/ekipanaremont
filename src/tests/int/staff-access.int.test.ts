import { type Payload, getPayload } from 'payload'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import config from '../../payload.config'
import type { Staff } from '../../payload-types'

let payload: Payload
let staffUser: Staff & { collection: 'staff' }

const newStaff = (email: string) => ({ email, name: 'Test', password: 'Haslo-testowe-123!' })

beforeAll(async () => {
  payload = await getPayload({ config })
  const doc = await payload.create({ collection: 'staff', data: newStaff('admin@test.local') })
  staffUser = { ...doc, collection: 'staff' }
})

afterAll(async () => {
  await payload.delete({ collection: 'staff', where: { email: { like: '@test.local' } } })
  await payload.destroy()
})

describe('dostęp do kolekcji staff', () => {
  describe('gość', () => {
    it('nie czyta listy personelu', async () => {
      await expect(payload.find({ collection: 'staff', overrideAccess: false })).rejects.toThrow()
    })

    it('nie tworzy konta personelu', async () => {
      await expect(
        payload.create({
          collection: 'staff',
          data: newStaff('intruz@test.local'),
          overrideAccess: false,
        }),
      ).rejects.toThrow()
    })

    it('nie edytuje ani nie usuwa konta personelu', async () => {
      await expect(
        payload.update({
          collection: 'staff',
          id: staffUser.id,
          data: { name: 'Zmiana' },
          overrideAccess: false,
        }),
      ).rejects.toThrow()
      await expect(
        payload.delete({ collection: 'staff', id: staffUser.id, overrideAccess: false }),
      ).rejects.toThrow()
    })
  })

  describe('zalogowany personel', () => {
    it('czyta, tworzy, edytuje i usuwa konta personelu', async () => {
      const asStaff = { overrideAccess: false, user: staffUser } as const

      const list = await payload.find({ collection: 'staff', ...asStaff })
      expect(list.docs.map((doc) => doc.email)).toContain('admin@test.local')

      const created = await payload.create({
        collection: 'staff',
        data: newStaff('nowy@test.local'),
        ...asStaff,
      })
      const updated = await payload.update({
        collection: 'staff',
        id: created.id,
        data: { name: 'Nowe imię' },
        ...asStaff,
      })
      expect(updated.name).toBe('Nowe imię')

      await payload.delete({ collection: 'staff', id: created.id, ...asStaff })
    })
  })

  it('nie ujawnia skrótu ani soli hasła', async () => {
    const doc = await payload.findByID({ collection: 'staff', id: staffUser.id })
    expect(doc).not.toHaveProperty('hash')
    expect(doc).not.toHaveProperty('salt')
  })
})
