import type { PayloadRequest } from 'payload'
import { describe, expect, it } from 'vitest'

import { firstStaffIsAdmin } from '../../hooks/firstStaffIsAdmin'

const run = (existing: number, operation: 'create' | 'update', role = 'editor') =>
  firstStaffIsAdmin({
    data: { role },
    operation,
    req: { payload: { count: async () => ({ totalDocs: existing }) } } as unknown as PayloadRequest,
  } as unknown as Parameters<typeof firstStaffIsAdmin>[0])

describe('pierwsze konto personelu', () => {
  it('jest administratorem, kolejne zachowują rolę', async () => {
    expect(await run(0, 'create')).toEqual({ role: 'admin' })
    expect(await run(2, 'create')).toEqual({ role: 'editor' })
    expect(await run(0, 'update', 'moderator')).toEqual({ role: 'moderator' })
  })
})
