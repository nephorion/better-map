import { frontendVersion, loadVersionMetadata } from './versionMetadata'

test('reads configured frontend version and falls back to dev', () => {
  vi.stubGlobal('__APP_VERSION__', 'frontabc123')
  expect(frontendVersion()).toBe('frontabc123')

  vi.stubGlobal('__APP_VERSION__', '')
  expect(frontendVersion()).toBe('dev')
})

test('returns frontend version metadata and matching backend hash', async () => {
  vi.stubGlobal('fetch', vi.fn(async () => Response.json({ short_hash: frontendVersion() })))

  await expect(loadVersionMetadata()).resolves.toEqual({
    frontend: frontendVersion(),
    backend: frontendVersion(),
    mismatch: false,
    error: null,
  })
})

test('reports backend version mismatch and ignores unavailable endpoint', async () => {
  vi.stubGlobal('fetch', vi.fn(async () => Response.json({ short_hash: 'other' })))
  expect(await loadVersionMetadata()).toMatchObject({ backend: 'other', mismatch: true })

  vi.stubGlobal('fetch', vi.fn(async () => new Response(null, { status: 503 })))
  expect(await loadVersionMetadata()).toMatchObject({ backend: null, mismatch: false, error: null })
})
