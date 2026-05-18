// SPDX-License-Identifier: AGPL-3.0-only
import { GOOGLE_ANALYTICS_ID, initializeGoogleAnalytics } from './analytics'

test('initializes default Google Analytics page-view configuration', () => {
  const ok = initializeGoogleAnalytics()

  expect(ok).toBe(true)
  const script = document.getElementById('better-map-google-analytics') as HTMLScriptElement
  expect(script.src).toContain(GOOGLE_ANALYTICS_ID)
  expect(script.async).toBe(true)
  expect(window.dataLayer).toEqual(expect.arrayContaining([['config', GOOGLE_ANALYTICS_ID]]))
})

test('does not add duplicate scripts or custom interaction events', () => {
  initializeGoogleAnalytics()
  initializeGoogleAnalytics()

  expect(document.querySelectorAll('#better-map-google-analytics')).toHaveLength(1)
  expect(window.dataLayer).not.toContainEqual(expect.arrayContaining(['event']))
  expect(window.dataLayer).not.toContainEqual(expect.arrayContaining(['callsign']))
  expect(window.dataLayer).not.toContainEqual(expect.arrayContaining(['donation']))
  expect(window.dataLayer).not.toContainEqual(expect.arrayContaining(['source']))
})

test('fails closed when analytics cannot be inserted', () => {
  const brokenDocument = {
    getElementById: () => null,
    createElement: () => {
      throw new Error('blocked')
    },
    head: { append: vi.fn() },
  } as unknown as Document

  expect(initializeGoogleAnalytics(brokenDocument)).toBe(false)
})
