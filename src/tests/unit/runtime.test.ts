import { describe, expect, it } from 'vitest'

import { isProductionDeployment } from '../../lib/runtime'

describe('isProductionDeployment', () => {
  it('rozpoznaje tylko produkcję Vercel', () => {
    expect(isProductionDeployment({ VERCEL_ENV: 'production' })).toBe(true)
    expect(isProductionDeployment({ VERCEL_ENV: 'preview' })).toBe(false)
    expect(isProductionDeployment({ NODE_ENV: 'production' })).toBe(false)
    expect(isProductionDeployment({})).toBe(false)
  })
})
