import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from './App'
import { ApiClientError } from './services/apiClient'
import { fetchWsprActivity } from './services/wsprActivity'

vi.mock('./services/wsprActivity', async () => {
  const actual = await vi.importActual<typeof import('./services/wsprActivity')>('./services/wsprActivity')
  return { ...actual, fetchWsprActivity: vi.fn() }
})

test('renders the app shell and map region', () => {
  render(<App />)

  expect(screen.getByRole('heading', { name: /wspr callsign activity map/i })).toBeInTheDocument()
  expect(screen.getByLabelText(/wspr activity map/i)).toBeInTheDocument()
})

test('loads empty search results', async () => {
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

  await user.type(screen.getByRole('textbox', { name: /^callsign$/i }), 'VK2DJJ')
  await user.click(screen.getByRole('button', { name: /search/i }))

  expect(await screen.findByText(/no recent wspr activity/i)).toBeInTheDocument()
})

test('shows truncated successful results', async () => {
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

  await user.type(screen.getByRole('textbox', { name: /^callsign$/i }), 'VK2DJJ')
  await user.click(screen.getByRole('button', { name: /search/i }))

  expect(await screen.findByText(/showing the most recent 1,000/i)).toBeInTheDocument()
})

test('shows non-truncated successful results', async () => {
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

  await user.type(screen.getByRole('textbox', { name: /^callsign$/i }), 'VK2DJJ')
  await user.click(screen.getByRole('button', { name: /search/i }))

  expect(await screen.findByText(/showing 2 wspr paths/i)).toBeInTheDocument()
})

test('shows non-destructive error state', async () => {
  vi.mocked(fetchWsprActivity).mockRejectedValueOnce(
    new ApiClientError('provider_timeout', 504, 'WSPR lookup timed out. Try again.'),
  )
  const user = userEvent.setup()
  render(<App />)

  await user.type(screen.getByRole('textbox', { name: /^callsign$/i }), 'VK2DJJ')
  await user.click(screen.getByRole('button', { name: /search/i }))

  expect(await screen.findByText(/previous successful results are preserved/i)).toBeInTheDocument()
})

test('shows fallback message for unknown errors', async () => {
  vi.mocked(fetchWsprActivity).mockRejectedValueOnce(new Error('boom'))
  const user = userEvent.setup()
  render(<App />)

  await user.type(screen.getByRole('textbox', { name: /^callsign$/i }), 'VK2DJJ')
  await user.click(screen.getByRole('button', { name: /search/i }))

  expect(await screen.findByText(/the wspr lookup failed/i)).toBeInTheDocument()
})
