import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from './App'
import { ApiClientError } from './services/apiClient'
import { fetchWsprActivity } from './services/wsprActivity'
import { clearStoredCallsign, seedStoredCallsign } from './test/storageTestUtils'

vi.mock('./services/wsprActivity', async () => {
  const actual = await vi.importActual<typeof import('./services/wsprActivity')>('./services/wsprActivity')
  return { ...actual, fetchWsprActivity: vi.fn() }
})

beforeEach(() => {
  vi.clearAllMocks()
  vi.unstubAllGlobals()
  window.localStorage.clear()
  clearStoredCallsign()
})

async function setCallsign(user: ReturnType<typeof userEvent.setup>, callsign = 'VK2DJJ') {
  await user.type(screen.getByRole('textbox', { name: /^callsign$/i }), callsign)
  await user.click(screen.getByRole('button', { name: /^set callsign$/i }))
}

test('renders the app shell and map region', () => {
  render(<App />)

  expect(screen.getByLabelText(/wspr activity map/i)).toBeInTheDocument()
  expect(screen.getByRole('dialog', { name: /choose callsign/i })).toBeInTheDocument()
})

test('loads empty search results without a success status panel', async () => {
  vi.mocked(fetchWsprActivity).mockResolvedValueOnce({
    callsign: 'VK2DJJ',
    window_days: 10,
    source: 'wspr.live',
    count: 0,
    truncated: false,
    features: [],
  })
  const user = userEvent.setup()
  render(<App />)

  await setCallsign(user)

  expect(await screen.findByText(/no map paths to display/i)).toBeInTheDocument()
  expect(screen.queryByRole('status')).not.toBeInTheDocument()
})

test('loads truncated successful results without a map notice panel', async () => {
  vi.mocked(fetchWsprActivity).mockResolvedValueOnce({
    callsign: 'VK2DJJ',
    window_days: 10,
    source: 'wspr.live',
    count: 1000,
    truncated: true,
    features: [],
  })
  const user = userEvent.setup()
  render(<App />)

  await setCallsign(user)

  expect(fetchWsprActivity).toHaveBeenCalledWith('VK2DJJ')
  expect(screen.queryByText(/showing only the most recent 1,000 records/i)).not.toBeInTheDocument()
  expect(screen.queryByText(/showing the most recent 1,000 wspr paths/i)).not.toBeInTheDocument()
})

test('loads non-truncated successful results without a success status panel', async () => {
  vi.mocked(fetchWsprActivity).mockResolvedValueOnce({
    callsign: 'VK2DJJ',
    window_days: 10,
    source: 'wspr.live',
    count: 2,
    truncated: false,
    features: [],
  })
  const user = userEvent.setup()
  render(<App />)

  await setCallsign(user)

  expect(fetchWsprActivity).toHaveBeenCalledWith('VK2DJJ')
  expect(screen.queryByText(/showing 2 wspr paths/i)).not.toBeInTheDocument()
})

test('shows non-destructive error state', async () => {
  vi.mocked(fetchWsprActivity).mockRejectedValueOnce(
    new ApiClientError('provider_timeout', 504, 'WSPR lookup timed out. Try again.'),
  )
  const user = userEvent.setup()
  render(<App />)

  await setCallsign(user)

  expect(await screen.findByText(/previous successful results are preserved/i)).toBeInTheDocument()
})

test('shows fallback message for unknown errors', async () => {
  vi.mocked(fetchWsprActivity).mockRejectedValueOnce(new Error('boom'))
  const user = userEvent.setup()
  render(<App />)

  await setCallsign(user)

  expect(await screen.findByText(/the wspr lookup failed/i)).toBeInTheDocument()
})

test('loads immediately for returning users with a saved callsign', async () => {
  vi.useFakeTimers()
  seedStoredCallsign('VK2DJJ')
  vi.mocked(fetchWsprActivity).mockResolvedValueOnce({
    callsign: 'VK2DJJ',
    window_days: 10,
    source: 'wspr.live',
    count: 0,
    truncated: false,
    features: [],
  })

  render(<App />)
  await vi.runOnlyPendingTimersAsync()

  expect(fetchWsprActivity).toHaveBeenCalledWith('VK2DJJ')
  expect(screen.queryByRole('dialog', { name: /choose callsign/i })).not.toBeInTheDocument()
  vi.useRealTimers()
})

test('recovers from invalid saved callsign and allows prompt dismissal', async () => {
  const user = userEvent.setup()
  seedStoredCallsign('?')
  render(<App />)

  expect(screen.getByText(/saved callsign was invalid/i)).toBeInTheDocument()
  await user.click(screen.getByRole('button', { name: /dismiss/i }))
  await user.click(screen.getByRole('button', { name: /^set callsign$/i }))
  expect(screen.getByRole('dialog', { name: /choose callsign/i })).toBeInTheDocument()
})

test('keeps invalid app prompt submissions in selection state', async () => {
  const user = userEvent.setup()
  render(<App />)

  await user.type(screen.getByRole('textbox', { name: /^callsign$/i }), '?')
  await user.click(screen.getByRole('button', { name: /^set callsign$/i }))

  expect(screen.getByText(/enter a valid callsign/i)).toBeInTheDocument()
})

test('changes base map, reopens callsign prompt, and refreshes manually', async () => {
  vi.mocked(fetchWsprActivity).mockResolvedValue({
    callsign: 'VK2DJJ',
    window_days: 10,
    source: 'wspr.live',
    count: 0,
    truncated: false,
    features: [],
  })
  const user = userEvent.setup()
  render(<App />)

  await setCallsign(user)
  await user.click(screen.getByRole('button', { name: /choose base map/i }))
  await user.click(screen.getByRole('button', { name: /openstreetmap humanitarian/i }))
  expect(window.localStorage.getItem('better-map.baseMapLayer')).toBe('osm-humanitarian')
  await user.click(screen.getByRole('button', { name: /active callsign/i }))
  expect(screen.getByRole('dialog', { name: /choose callsign/i })).toBeInTheDocument()
  await user.click(screen.getByRole('button', { name: /refresh wspr activity/i }))
  expect(fetchWsprActivity).toHaveBeenCalledTimes(2)
})

test('starts with the saved base map layer', () => {
  window.localStorage.setItem('better-map.baseMapLayer', 'carto-positron')

  render(<App />)

  expect(screen.queryByLabelText(/map attribution/i)).not.toBeInTheDocument()
  expect(screen.getByRole('button', { name: /choose base map/i })).toBeInTheDocument()
})

test('shows version mismatch status when metadata differs', async () => {
  vi.stubGlobal('fetch', vi.fn(async () => Response.json({ short_hash: 'backend' })))
  render(<App />)

  expect(await screen.findByText(/versions do not match/i)).toBeInTheDocument()
})

test('warns when callsign cannot be persisted and blocks duplicate refreshes', async () => {
  const user = userEvent.setup()
  let resolveLookup: (value: Awaited<ReturnType<typeof fetchWsprActivity>>) => void = () => {}
  vi.mocked(fetchWsprActivity).mockReturnValue(
    new Promise((resolve) => {
      resolveLookup = resolve
    }),
  )
  vi.spyOn(Storage.prototype, 'setItem').mockImplementationOnce(() => {
    throw new Error('blocked')
  })
  render(<App />)

  await setCallsign(user)
  expect(fetchWsprActivity).toHaveBeenCalledTimes(1)

  resolveLookup({
    callsign: 'VK2DJJ',
    window_days: 10,
    source: 'wspr.live',
    count: 0,
    truncated: false,
    features: [],
  })
})

test('automatically refreshes when countdown reaches zero', async () => {
  vi.useFakeTimers()
  seedStoredCallsign('VK2DJJ')
  vi.mocked(fetchWsprActivity).mockResolvedValue({
    callsign: 'VK2DJJ',
    window_days: 10,
    source: 'wspr.live',
    count: 0,
    truncated: false,
    features: [],
  })
  render(<App />)

  await vi.runOnlyPendingTimersAsync()
  await vi.advanceTimersByTimeAsync(301_000)

  expect(fetchWsprActivity).toHaveBeenCalledTimes(3)
  vi.useRealTimers()
})
