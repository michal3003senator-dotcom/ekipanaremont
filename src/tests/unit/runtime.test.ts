import { describe, expect, it } from 'vitest'

import { codespaceUrl, isProductionDeployment, withCodespaceUrl } from '../../lib/runtime'

describe('isProductionDeployment', () => {
  it('rozpoznaje tylko produkcję Vercel', () => {
    expect(isProductionDeployment({ VERCEL_ENV: 'production' })).toBe(true)
    expect(isProductionDeployment({ VERCEL_ENV: 'preview' })).toBe(false)
    expect(isProductionDeployment({ NODE_ENV: 'production' })).toBe(false)
    expect(isProductionDeployment({})).toBe(false)
  })
})

describe('Codespaces', () => {
  const codespace = {
    CODESPACE_NAME: 'robot-x1',
    GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN: 'app.github.dev',
  }

  it('adres portu tylko w Codespaces', () => {
    expect(codespaceUrl(codespace)).toBe('https://robot-x1-3000.app.github.dev')
    expect(codespaceUrl({})).toBeUndefined()
  })

  it('zamienia tylko localhost, własny adres zostaje', () => {
    const local = { ...codespace, NEXT_PUBLIC_SERVER_URL: 'http://localhost:3000' }
    expect(withCodespaceUrl(local).NEXT_PUBLIC_SERVER_URL).toBe(
      'https://robot-x1-3000.app.github.dev',
    )
    const custom = { ...codespace, NEXT_PUBLIC_SERVER_URL: 'https://staging.example.pl' }
    expect(withCodespaceUrl(custom).NEXT_PUBLIC_SERVER_URL).toBe('https://staging.example.pl')
    expect(withCodespaceUrl({ NEXT_PUBLIC_SERVER_URL: 'http://localhost:3000' })).toEqual({
      NEXT_PUBLIC_SERVER_URL: 'http://localhost:3000',
    })
  })
})
