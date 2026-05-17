import { expect, test } from '@playwright/test'

const activityPayload = {
  callsign: 'VK2DJJ',
  window_days: 10,
  source: 'wspr.live',
  count: 1,
  truncated: false,
  features: [
    {
      id: 'contact-1',
      type: 'Feature',
      geometry: {
        type: 'LineString',
        coordinates: [
          [151.2, -33.8],
          [144.9, -37.8],
        ],
      },
      properties: {
        time: '2026-05-16T10:30:00Z',
        tx_sign: 'VK2DJJ',
        rx_sign: 'VK3ABC',
        distance_km: 713,
        frequency_hz: 14095600,
        band: '20m',
        snr_db: -18,
        power_dbm: 30,
        role: 'transmitter',
      },
    },
  ],
}

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => window.localStorage.clear())
  await page.route('**/api/version', async (route) => {
    await route.fulfill({ json: { short_hash: 'e2etest' } })
  })
  await page.route('**/api/wspr/activity?**', async (route) => {
    await route.fulfill({ json: activityPayload })
  })
})

test('renders the full-window map without a bottom-left path list', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('textbox', { name: 'Callsign' }).fill('VK2DJJ')
  await page.getByRole('button', { name: 'Set Callsign', exact: true }).click()

  await expect(page.getByLabel('World map')).toBeVisible()
  await expect(page.locator('.maplibregl-canvas')).toBeVisible()
  await expect(page.getByLabel(/keyboard selectable wspr paths/i)).toHaveCount(0)
  await expect(page.getByRole('button', { name: /VK2DJJ -> VK3ABC/i })).toHaveCount(0)
  await expect(page.getByRole('button', { name: /choose base map/i })).toBeVisible()
})

test('keeps overlay controls usable over the browser-rendered map', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('textbox', { name: 'Callsign' }).fill('VK2DJJ')
  await page.getByRole('button', { name: 'Set Callsign', exact: true }).click()

  await expect(page.getByRole('button', { name: /active callsign/i })).toBeVisible()
  await page.getByRole('button', { name: /choose base map/i }).click()
  await expect(page.getByRole('dialog', { name: /base map choices/i })).toBeVisible()
  await expect(page.getByRole('button', { name: /carto positron/i })).toBeVisible()
  await page.getByRole('button', { name: /opentopomap/i }).click()
  await expect(page.getByText(/CC-BY-SA/i)).toHaveCount(0)
  await expect(page.getByRole('button', { name: /refresh wspr activity/i })).toBeVisible()
  await expect(page.getByLabel('Frontend version hash')).not.toBeEmpty()
})
