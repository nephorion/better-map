import maplibregl from 'maplibre-gl'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { WsprMap } from './WsprMap'
import type { ActivityFeature } from '../services/wsprActivity'

type MapLibreMocks = {
  addLayer: ReturnType<typeof vi.fn>
  addSource: ReturnType<typeof vi.fn>
  extend: ReturnType<typeof vi.fn>
  fitBounds: ReturnType<typeof vi.fn>
  getSource: ReturnType<typeof vi.fn>
  loadHandler?: () => void
  remove: ReturnType<typeof vi.fn>
  setData: ReturnType<typeof vi.fn>
}

const mocks = (maplibregl as unknown as { __mocks: MapLibreMocks }).__mocks

const feature: ActivityFeature = {
  id: '1',
  type: 'Feature',
  geometry: { type: 'LineString', coordinates: [[151.2, -33.8], [144.9, -37.8]] },
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
}

beforeEach(() => {
  vi.clearAllMocks()
  mocks.getSource.mockReturnValue(undefined)
  mocks.loadHandler = undefined
})

test('shows an empty map state on a real world map container', () => {
  const { unmount } = render(<WsprMap features={[]} />)

  expect(screen.getByText(/no map paths/i)).toBeInTheDocument()
  expect(screen.getByLabelText(/world map/i)).toBeInTheDocument()
  unmount()
  expect(mocks.remove).toHaveBeenCalled()
})

test('loads an empty GeoJSON collection without fitting bounds', async () => {
  render(<WsprMap features={[]} />)

  mocks.loadHandler?.()

  await waitFor(() => expect(mocks.addSource).toHaveBeenCalled())
  expect(mocks.fitBounds).not.toHaveBeenCalled()
})

test('adds WSPR paths as GeoJSON map data and fits bounds', async () => {
  render(<WsprMap features={[feature]} truncated />)

  mocks.loadHandler?.()

  await waitFor(() => expect(mocks.addSource).toHaveBeenCalled())
  expect(mocks.addLayer).toHaveBeenCalledWith(expect.objectContaining({ id: 'wspr-paths', type: 'line' }))
  expect(mocks.fitBounds).toHaveBeenCalled()
  expect(screen.getByText(/most recent 1,000/i)).toBeInTheDocument()
})

test('updates an existing GeoJSON source when paths change', async () => {
  mocks.getSource.mockReturnValue({ setData: mocks.setData })
  render(<WsprMap features={[feature]} />)

  mocks.loadHandler?.()

  await waitFor(() => expect(mocks.setData).toHaveBeenCalled())
})

test('renders path buttons and selected details', async () => {
  const user = userEvent.setup()
  render(<WsprMap features={[feature]} />)

  await user.click(screen.getByRole('button', { name: /VK2DJJ -> VK3ABC/i }))
  expect(screen.getByText(/VK2DJJ to VK3ABC/i)).toBeInTheDocument()
})

test('selection interaction stays under the responsiveness target', async () => {
  const user = userEvent.setup()
  render(<WsprMap features={[feature]} />)

  const start = performance.now()
  await user.click(screen.getByRole('button', { name: /VK2DJJ -> VK3ABC/i }))
  const elapsed = performance.now() - start

  expect(elapsed).toBeLessThan(250)
})

test('selects a path using keyboard activation', async () => {
  const user = userEvent.setup()
  render(<WsprMap features={[feature]} />)

  await user.tab()
  await user.keyboard('{Enter}')

  expect(screen.getByText(/VK2DJJ to VK3ABC/i)).toBeInTheDocument()
})
