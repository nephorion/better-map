// SPDX-License-Identifier: AGPL-3.0-only
import maplibregl from 'maplibre-gl'
import * as deckModule from '@deck.gl/mapbox'
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { WsprMap } from './WsprMap'
import type { ActivityFeature } from '../services/wsprActivity'
import * as terminatorService from '../services/terminator'

type MapLibreMocks = {
  addLayer: ReturnType<typeof vi.fn>
  addControl: ReturnType<typeof vi.fn>
  addSource: ReturnType<typeof vi.fn>
  extend: ReturnType<typeof vi.fn>
  fitBounds: ReturnType<typeof vi.fn>
  getCenter: ReturnType<typeof vi.fn>
  getContainer: ReturnType<typeof vi.fn>
  getSource: ReturnType<typeof vi.fn>
  getZoom: ReturnType<typeof vi.fn>
  loadHandler?: () => void
  moveEndHandler?: () => void
  sourceDataHandler?: () => void
  styleDataHandler?: () => void
  remove: ReturnType<typeof vi.fn>
  setData: ReturnType<typeof vi.fn>
  setStyle: ReturnType<typeof vi.fn>
}

const mocks = (maplibregl as unknown as { __mocks: MapLibreMocks }).__mocks
const deckMocks = (deckModule as unknown as { __mocks: { setProps: ReturnType<typeof vi.fn> } }).__mocks

type DeckLayer = {
  props: {
    id: string
    [key: string]: unknown
  }
}

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
  vi.useRealTimers()
  vi.restoreAllMocks()
  vi.clearAllMocks()
  mocks.getSource.mockReturnValue(undefined)
  mocks.loadHandler = undefined
  mocks.moveEndHandler = undefined
  mocks.sourceDataHandler = undefined
  mocks.styleDataHandler = undefined
  mocks.getContainer.mockReturnValue(document.createElement('div'))
  window.localStorage.clear()
})

function latestDeckLayers() {
  const latestProps = deckMocks.setProps.mock.calls.at(-1)?.[0] as { layers: DeckLayer[] }
  return latestProps.layers
}

function latestDeckLayer(id: string) {
  const layer = latestDeckLayers().find((candidate) => candidate.props.id === id)
  if (!layer) throw new Error(`Missing deck layer ${id}`)
  return layer
}

function mockVisibilityState(visibilityState: DocumentVisibilityState) {
  vi.spyOn(document, 'visibilityState', 'get').mockReturnValue(visibilityState)
}

test('shows an empty map state on a real world map container', () => {
  const { unmount } = render(<WsprMap features={[]} />)

  expect(screen.getByText(/no map paths/i)).toBeInTheDocument()
  expect(screen.getByLabelText(/world map/i)).toBeInTheDocument()
  expect(screen.queryByLabelText(/keyboard selectable wspr paths/i)).not.toBeInTheDocument()
  unmount()
  expect(mocks.remove).toHaveBeenCalled()
})

test('keeps map attribution collapsed by default', () => {
  const container = document.createElement('div')
  const attribution = document.createElement('details')
  attribution.className = 'maplibregl-ctrl-attrib maplibregl-compact maplibregl-compact-show'
  attribution.setAttribute('open', '')
  container.append(attribution)
  mocks.getContainer.mockReturnValue(container)

  render(<WsprMap features={[]} />)

  expect(mocks.addControl).toHaveBeenCalledWith(expect.objectContaining({ options: { compact: true } }))
  expect(attribution).not.toHaveAttribute('open')
  expect(attribution).not.toHaveClass('maplibregl-compact-show')
})

test('keeps map attribution collapsed after attribution data updates', () => {
  const container = document.createElement('div')
  const attribution = document.createElement('details')
  attribution.className = 'maplibregl-ctrl-attrib maplibregl-compact maplibregl-compact-show'
  attribution.setAttribute('open', '')
  container.append(attribution)
  mocks.getContainer.mockReturnValue(container)

  render(<WsprMap features={[]} />)
  attribution.classList.add('maplibregl-compact-show')
  attribution.setAttribute('open', '')
  mocks.styleDataHandler?.()
  attribution.classList.add('maplibregl-compact-show')
  attribution.setAttribute('open', '')
  mocks.sourceDataHandler?.()

  expect(attribution).not.toHaveAttribute('open')
  expect(attribution).not.toHaveClass('maplibregl-compact-show')
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

  const pathLayer = latestDeckLayer('wspr-deck-paths') as DeckLayer & {
    props: { onClick: (info: { object: unknown }) => void }
  }
  pathLayer.props.onClick({ object: { id: '1' } })

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

  const pathLayer = latestDeckLayer('wspr-deck-paths') as DeckLayer & {
    props: { onClick: (info: { object: unknown }) => void }
  }
  pathLayer.props.onClick({ object: { id: '1' } })

  expect(await screen.findByText(/VK2DJJ to VK3ABC/i)).toBeInTheDocument()
})

test('uses deck.gl accessors and ignores empty pointer hits', async () => {
  render(<WsprMap features={[feature]} />)
  mocks.loadHandler?.()
  await waitFor(() => expect(deckMocks.setProps).toHaveBeenCalled())

  const pathLayer = latestDeckLayer('wspr-deck-paths') as DeckLayer & {
    props: {
      getPath: (path: { coordinates: unknown }) => unknown
      getColor: (path: { id: string }) => number[]
      getWidth: (path: { id: string }) => number
      onClick: (info: { object: { id: string } | null }) => void
    }
  }
  const layerProps = pathLayer.props

  expect(layerProps.getPath({ coordinates: feature.geometry.coordinates })).toEqual(feature.geometry.coordinates)
  expect(layerProps.getColor({ id: 'missing' })).toEqual([104, 211, 255, 220])
  expect(layerProps.getWidth({ id: 'missing' })).toBe(3)
  act(() => {
    layerProps.onClick({ object: null })
    layerProps.onClick({ object: { id: '1' } })
  })

  await screen.findByText(/VK2DJJ to VK3ABC/i)
  const selectedPathLayer = latestDeckLayer('wspr-deck-paths') as typeof pathLayer
  expect(selectedPathLayer.props.getColor({ id: '1' })).toEqual([255, 222, 122, 245])
  expect(selectedPathLayer.props.getWidth({ id: '1' })).toBe(5)
  fireEvent.click(screen.getByRole('button', { name: /close/i }))
  expect(screen.queryByLabelText(/selected wspr activity details/i)).not.toBeInTheDocument()
})

test('renders grayline overlay behind WSPR paths', async () => {
  render(<WsprMap features={[feature]} />)
  mocks.loadHandler?.()

  await waitFor(() => expect(deckMocks.setProps).toHaveBeenCalled())
  const layers = latestDeckLayers()
  expect(layers.map((layer) => layer.props.id)).toEqual([
    'grayline-terminator-overlay',
    'grayline-terminator-line',
    'wspr-deck-paths',
  ])
  const graylineLayer = latestDeckLayer('grayline-terminator-overlay') as DeckLayer & {
    props: {
      data: unknown[][]
      getPolygon: (polygon: unknown[]) => unknown[]
      getFillColor: number[]
      pickable: boolean
    }
  }
  const graylineLine = latestDeckLayer('grayline-terminator-line') as DeckLayer & {
    props: { data: Array<{ path: unknown[] }>, getPath: (segment: { path: unknown[] }) => unknown[] }
  }
  expect(graylineLayer.props.getPolygon(graylineLayer.props.data[0])).toEqual(graylineLayer.props.data[0])
  expect(graylineLine.props.getPath(graylineLine.props.data[0])).toEqual(graylineLine.props.data[0].path)
  expect(graylineLayer.props.getFillColor[3]).toBeLessThan(80)
  expect(graylineLayer.props.pickable).toBe(false)
})

test('keeps the map usable when the initial grayline cannot be created', async () => {
  vi.spyOn(terminatorService, 'createGraylineTerminator').mockImplementationOnce(() => {
    throw new Error('blocked')
  })
  render(<WsprMap features={[]} />)
  act(() => mocks.loadHandler?.())

  expect(screen.getByLabelText(/world map/i)).toBeInTheDocument()
  expect(latestDeckLayers().map((layer) => layer.props.id)).toEqual(['wspr-deck-paths'])
})

test('refreshes grayline every five visible minutes and preserves selected path details', async () => {
  vi.useFakeTimers()
  mockVisibilityState('visible')
  vi.setSystemTime(new Date('2026-05-18T00:00:00Z'))
  render(<WsprMap features={[feature]} baseLayerId="carto-positron" activeCallsign="VK2DJJ" />)
  act(() => mocks.loadHandler?.())
  expect(deckMocks.setProps).toHaveBeenCalled()
  const initialGrayline = latestDeckLayer('grayline-terminator-line') as DeckLayer & {
    props: { data: Array<{ observationTime: string }> }
  }
  const pathLayer = latestDeckLayer('wspr-deck-paths') as DeckLayer & {
    props: { onClick: (info: { object: unknown }) => void }
  }
  act(() => pathLayer.props.onClick({ object: { id: '1' } }))
  expect(screen.getByText(/VK2DJJ to VK3ABC/i)).toBeInTheDocument()
  mocks.setStyle.mockClear()
  mocks.fitBounds.mockClear()

  await act(async () => {
    await vi.advanceTimersByTimeAsync(300_000)
  })

  const refreshedGrayline = latestDeckLayer('grayline-terminator-line') as typeof initialGrayline
  expect(refreshedGrayline.props.data[0].observationTime).not.toBe(initialGrayline.props.data[0].observationTime)
  expect(screen.getByLabelText(/selected wspr activity details/i)).toBeInTheDocument()
  expect(mocks.setStyle).not.toHaveBeenCalled()
  expect(mocks.fitBounds).not.toHaveBeenCalled()
})

test('does not refresh hidden sessions until stale visibility return', async () => {
  vi.useFakeTimers()
  mockVisibilityState('visible')
  vi.setSystemTime(new Date('2026-05-18T00:00:00Z'))
  render(<WsprMap features={[]} />)
  act(() => mocks.loadHandler?.())
  expect(deckMocks.setProps).toHaveBeenCalled()
  const initialGrayline = latestDeckLayer('grayline-terminator-line') as DeckLayer & {
    props: { data: Array<{ observationTime: string }> }
  }

  mockVisibilityState('hidden')
  await act(async () => {
    await vi.advanceTimersByTimeAsync(300_000)
  })
  const hiddenGrayline = latestDeckLayer('grayline-terminator-line') as typeof initialGrayline
  expect(hiddenGrayline.props.data[0].observationTime).toBe(initialGrayline.props.data[0].observationTime)

  mockVisibilityState('visible')
  act(() => document.dispatchEvent(new Event('visibilitychange')))

  const visibleGrayline = latestDeckLayer('grayline-terminator-line') as typeof initialGrayline
  expect(visibleGrayline.props.data[0].observationTime).toBe('2026-05-18T00:05:00.000Z')
})

test('keeps fresh visibility returns on the existing schedule', async () => {
  vi.useFakeTimers()
  mockVisibilityState('visible')
  vi.setSystemTime(new Date('2026-05-18T00:00:00Z'))
  render(<WsprMap features={[]} />)
  act(() => mocks.loadHandler?.())
  expect(deckMocks.setProps).toHaveBeenCalled()
  const initialGrayline = latestDeckLayer('grayline-terminator-line') as DeckLayer & {
    props: { data: Array<{ observationTime: string }> }
  }

  mockVisibilityState('hidden')
  await act(async () => {
    await vi.advanceTimersByTimeAsync(60_000)
  })
  mockVisibilityState('visible')
  act(() => document.dispatchEvent(new Event('visibilitychange')))

  const visibleGrayline = latestDeckLayer('grayline-terminator-line') as typeof initialGrayline
  expect(visibleGrayline.props.data[0].observationTime).toBe(initialGrayline.props.data[0].observationTime)
})

test('ignores visibility change events while still hidden', async () => {
  vi.useFakeTimers()
  mockVisibilityState('visible')
  vi.setSystemTime(new Date('2026-05-18T00:00:00Z'))
  render(<WsprMap features={[]} />)
  act(() => mocks.loadHandler?.())
  expect(deckMocks.setProps).toHaveBeenCalled()
  const initialGrayline = latestDeckLayer('grayline-terminator-line') as DeckLayer & {
    props: { data: Array<{ observationTime: string }> }
  }

  mockVisibilityState('hidden')
  await act(async () => {
    await vi.advanceTimersByTimeAsync(300_000)
  })
  act(() => document.dispatchEvent(new Event('visibilitychange')))

  const hiddenGrayline = latestDeckLayer('grayline-terminator-line') as typeof initialGrayline
  expect(hiddenGrayline.props.data[0].observationTime).toBe(initialGrayline.props.data[0].observationTime)
})

test('preserves previous grayline after refresh failure and retries later', async () => {
  vi.useFakeTimers()
  mockVisibilityState('visible')
  vi.setSystemTime(new Date('2026-05-18T00:00:00Z'))
  render(<WsprMap features={[]} />)
  act(() => mocks.loadHandler?.())
  expect(deckMocks.setProps).toHaveBeenCalled()
  const initialGrayline = latestDeckLayer('grayline-terminator-line') as DeckLayer & {
    props: { data: Array<{ observationTime: string }> }
  }
  vi.spyOn(terminatorService, 'createGraylineTerminator').mockImplementationOnce(() => {
    throw new Error('transient')
  })

  await act(async () => {
    await vi.advanceTimersByTimeAsync(300_000)
  })
  const failedRefreshGrayline = latestDeckLayer('grayline-terminator-line') as typeof initialGrayline
  expect(failedRefreshGrayline.props.data[0].observationTime).toBe(initialGrayline.props.data[0].observationTime)

  await act(async () => {
    await vi.advanceTimersByTimeAsync(300_000)
  })
  const recoveredGrayline = latestDeckLayer('grayline-terminator-line') as typeof initialGrayline
  expect(recoveredGrayline.props.data[0].observationTime).toBe('2026-05-18T00:10:00.000Z')
})
