import { ApiClientError } from './apiClient'
import { fetchWsprActivity } from './wsprActivity'

const successPayload = {
  callsign: 'VK2DJJ',
  window_days: 10,
  source: 'wspr.live',
  count: 0,
  truncated: false,
  features: [],
}

function mockFetch(response: Response) {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(response))
}

afterEach(() => {
  vi.unstubAllGlobals()
})

test('fetches activity results', async () => {
  mockFetch(Response.json(successPayload))

  await expect(fetchWsprActivity('VK2DJJ')).resolves.toEqual(successPayload)
})

test.each([
  ['invalid_request', 400],
  ['provider_rate_limited', 429],
  ['provider_unavailable', 502],
  ['provider_invalid_data', 502],
  ['provider_timeout', 504],
] as const)('maps %s errors', async (code, status) => {
  mockFetch(Response.json({ detail: { code, message: 'Lookup failed.' } }, { status }))

  await expect(fetchWsprActivity('VK2DJJ')).rejects.toMatchObject(
    new ApiClientError(code, status, 'Lookup failed.'),
  )
})

test('uses fallback error details for unknown failures', async () => {
  mockFetch(new Response('nope', { status: 500 }))

  await expect(fetchWsprActivity('VK2DJJ')).rejects.toMatchObject(
    new ApiClientError('unknown_error', 500, 'The WSPR lookup failed. Try again.'),
  )
})

test('supports empty and truncated payloads', async () => {
  mockFetch(Response.json({ ...successPayload, count: 1000, truncated: true }))

  await expect(fetchWsprActivity('VK2DJJ')).resolves.toMatchObject({
    count: 1000,
    truncated: true,
  })
})
