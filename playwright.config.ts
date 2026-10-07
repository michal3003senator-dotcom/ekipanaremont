import { defineConfig, devices } from '@playwright/test'

const isCI = Boolean(process.env.CI)
const baseURL = 'http://localhost:3000'

export default defineConfig({
  testDir: 'src/tests/e2e',
  testMatch: '**/*.e2e.ts',
  forbidOnly: isCI,
  reporter: isCI ? [['github'], ['html', { open: 'never' }]] : 'list',
  use: { baseURL, trace: 'retain-on-failure' },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'] } },
    {
      // Najwęższy wspierany ekran (Definition of Done: 360 px).
      name: 'mobile-360',
      use: {
        ...devices['Pixel 7'],
        viewport: { width: 360, height: 780 },
      },
    },
  ],
  webServer: {
    // CI testuje zbudowaną aplikację; lokalnie serwer deweloperski (lub już uruchomiony).
    command: isCI ? 'pnpm start' : 'pnpm dev',
    url: baseURL,
    reuseExistingServer: !isCI,
    timeout: 180_000,
  },
})
