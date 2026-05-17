import maplibregl from 'maplibre-gl'
import * as deckModule from '@deck.gl/mapbox'
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { WsprMap } from './WsprMap'
import type { ActivityFeature } from '../services/wsprActivity'

type MapLibreMocks = {
  addLayer: ReturnType<typeof vi.fn>
  addSource: ReturnType<typeof vi.fn>
  extend: ReturnType<typeof vi.fn>
  fitBounds: ReturnType<typeof vi.fn>
  getCenter: ReturnType<typeof vi.fn>
  getSource: ReturnType<typeof vi.fn>
  getZoom: ReturnType<typeof vi.fn>
  loadHandler?: () => void
  moveEndHandler?: () => void
  remove: ReturnType<typeof vi.fn>
  setData: ReturnType<typeof vi.fn>
  setStyle: ReturnType<typeof vi.fn>
}

const mocks = (maplibregl as unknown as { __mocks: MapLibreMocks }).__mocks
const deckMocks = (deckModule as unknown as { __mocks: { setProps: ReturnType<typeof vi.fn> } }).__mocks

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
  mocks.moveEndHandler = undefined
  window.localStorage.clear()
})

test('shows an empty map state on a real world map container', () => {
  const { unmount } = render(<WsprMap features={[]} />)

  expect(screen.getByText(/no map paths/i)).toBeInTheDocument()
  expect(screen.getByLabelText(/world map/i)).toBeInTheDocument()
  expect(screen.queryByLabelText(/keyboard selectable wspr paths/i)).not.toBeInTheDocument()
  unmount()
  expect(mocks.remove).toHaveBeenCalled()
})

test('loads an empty deck.gl collection without fitting bounds', async () => {
  render(<WsprMap features={[]} />)

  mocks.loadHandler?.()

  await waitFor(() => expect(deckMocks.setProps).toHaveBeenCalled())
  expect(mocks.fitBounds).not.toHaveBeenCalled()
})

test('adds WSPR paths as a deck.gl path layer without changing map view', async () => {
  render(<WsprMap features={[feature]} truncated />)

  mocks.loadHandler?.()

  await waitFor(() => expect(deckMocks.setProps).toHaveBeenCalled())
  expect(mocks.fitBounds).not.toHaveBeenCalled()
  expect(screen.queryByText(/most recent 1,000/i)).not.toBeInTheDocument()
})

test('does not refit bounds when selection changes', async () => {
  render(<WsprMap features={[feature]} />)
  mocks.loadHandler?.()
  await waitFor(() => expect(deckMocks.setProps).toHaveBeenCalled())

  const latestProps = deckMocks.setProps.mock.calls.at(-1)?.[0] as { layers: Array<{ props: { onClick: (info: { object: unknown }) => void } }> }
  latestProps.layers[0].props.onClick({ object: { id: '1' } })

  await screen.findByText(/VK2DJJ to VK3ABC/i)
  expect(mocks.fitBounds).not.toHaveBeenCalled()
})

test('stores map center and zoom when user moves the map', () => {
  render(<WsprMap features={[]} />)

  mocks.moveEndHandler?.()

  expect(window.localStorage.getItem('better-map.mapView')).toBe(JSON.stringify({ center: [151, -34], zoom: 4 }))
})

test('updates deck.gl overlay props when paths change', async () => {
  mocks.getSource.mockReturnValue({ setData: mocks.setData })
  render(<WsprMap features={[feature]} />)

  mocks.loadHandler?.()

  await waitFor(() => expect(deckMocks.setProps).toHaveBeenCalled())
})

test('switches base map style when active layer changes', async () => {
  const { rerender } = render(<WsprMap features={[]} baseLayerId="osm-standard" />)
  mocks.loadHandler?.()

  rerender(<WsprMap features={[]} baseLayerId="opentopomap" />)

  await waitFor(() => expect(mocks.setStyle).toHaveBeenCalled())
})

test('selects a path from deck.gl pointer interaction', async () => {
  render(<WsprMap features={[feature]} />)
  mocks.loadHandler?.()
  await waitFor(() => expect(deckMocks.setProps).toHaveBeenCalled())

  const latestProps = deckMocks.setProps.mock.calls.at(-1)?.[0] as { layers: Array<{ props: { onClick: (info: { object: unknown }) => void } }> }
  latestProps.layers[0].props.onClick({ object: { id: '1' } })

  expect(await screen.findByText(/VK2DJJ to VK3ABC/i)).toBeInTheDocument()
})

test('uses deck.gl accessors and ignores empty pointer hits', async () => {
  render(<WsprMap features={[feature]} />)
  mocks.loadHandler?.()
  await waitFor(() => expect(deckMocks.setProps).toHaveBeenCalled())

  const latestProps = deckMocks.setProps.mock.calls.at(-1)?.[0] as {
    layers: Array<{
      props: {
        getPath: (path: { coordinates: unknown }) => unknown
        getColor: (path: { id: string }) => number[]
        getWidth: (path: { id: string }) => number
        onClick: (info: { object: { id: string } | null }) => void
      }
    }>
  }
  const layerProps = latestProps.layers[0].props

  expect(layerProps.getPath({ coordinates: feature.geometry.coordinates })).toEqual(feature.geometry.coordinates)
  expect(layerProps.getColor({ id: 'missing' })).toEqual([104, 211, 255, 220])
  expect(layerProps.getWidth({ id: 'missing' })).toBe(3)
  act(() => {
    layerProps.onClick({ object: null })
    layerProps.onClick({ object: { id: '1' } })
  })

  await screen.findByText(/VK2DJJ to VK3ABC/i)
  const selectedProps = deckMocks.setProps.mock.calls.at(-1)?.[0] as typeof latestProps
  expect(selectedProps.layers[0].props.getColor({ id: '1' })).toEqual([255, 222, 122, 245])
  expect(selectedProps.layers[0].props.getWidth({ id: '1' })).toBe(5)
  fireEvent.click(screen.getByRole('button', { name: /close/i }))
  expect(screen.queryByLabelText(/selected wspr activity details/i)).not.toBeInTheDocument()
})
