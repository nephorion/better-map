import { expect, test } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => window.localStorage.clear())
  await page.route('**/api/version', async (route) => {
    await route.fulfill({ json: { short_hash: 'e2etest' } })
  })
  await page.route('**/api/wspr/activity?**', async (route) => {
    await route.fulfill({ json: { callsign: 'VK2DJJ', window_days: 10, source: 'wspr.live', count: 0, truncated: false, features: [] } })
  })
})

test('keeps support controls subtle and reachable on desktop', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 })
  await page.goto('/')

  await expect(page.getByRole('button', { name: /donate/i })).toBeVisible()
  await expect(page.getByRole('link', { name: /visit nephorion main site/i })).toBeVisible()
  await expect(page.getByRole('dialog')).toHaveCount(1)
  await page.getByRole('button', { name: /donate/i }).hover()
  await expect(page.getByText('Donate')).toBeVisible()
  await page.getByRole('button', { name: /donate/i }).click()
  await expect(page.getByLabel(/support better map on ko-fi/i)).toBeVisible()
  await expect(page.getByRole('dialog')).toHaveCount(1)
})

test('keeps support controls reachable on mobile without covering primary controls', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/')
  await page.getByRole('textbox', { name: 'Callsign' }).fill('VK2DJJ')
  await page.getByRole('button', { name: 'Set Callsign', exact: true }).click()

  await expect(page.getByRole('button', { name: /donate/i })).toBeVisible()
  await expect(page.getByRole('link', { name: /visit nephorion main site/i })).toBeVisible()
  await expect(page.getByRole('button', { name: /choose base map/i })).toBeVisible()
  await expect(page.getByRole('button', { name: /refresh wspr activity/i })).toBeVisible()
})
