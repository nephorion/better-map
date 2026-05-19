// SPDX-License-Identifier: AGPL-3.0-only
import maplibregl from 'maplibre-gl'
import * as deckModule from '@deck.gl/mapbox'
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { WsprMap } from './WsprMap'
import type { ActivityFeature } from '../services/wsprActivity'
import * as terminatorService from '../services/terminator'
import { defaultUserConfig, type UserConfig } from '../services/userConfig'

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

const fortyMeterFeature: ActivityFeature = {
  ...feature,
  id: '2',
  properties: { ...feature.properties, band: '40m', tx_sign: 'VK4AAA' },
}

const heardFeature: ActivityFeature = {
  ...feature,
  id: 'heard',
  properties: { ...feature.properties, role: 'receiver', tx_sign: 'VK4AAA' },
}

function configWithBands(values: UserConfig['bandSelection']['values']): UserConfig {
  return { ...defaultUserConfig(), bandSelection: { kind: 'specific', values } }
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

test('opens configuration panel from the map cog and saves settings', async () => {
  const onSaveConfig = vi.fn()
  render(<WsprMap features={[]} userConfig={defaultUserConfig()} onSaveConfig={onSaveConfig} />)

  fireEvent.click(screen.getByRole('button', { name: /open map configuration/i }))
  expect(screen.getByRole('dialog', { name: /map configuration/i })).toBeInTheDocument()
  fireEvent.change(screen.getByRole('textbox', { name: /callsign/i }), { target: { value: 'vk2djj' } })
  fireEvent.click(screen.getByRole('button', { name: /save configuration/i }))

  expect(onSaveConfig).toHaveBeenCalledWith(expect.objectContaining({ callsign: 'VK2DJJ' }))
})

test('closes local configuration panel when no external handlers are provided', () => {
  render(<WsprMap features={[]} />)

  fireEvent.click(screen.getByRole('button', { name: /open map configuration/i }))
  expect(screen.getByRole('dialog', { name: /map configuration/i })).toBeInTheDocument()
  fireEvent.click(screen.getByRole('button', { name: /dismiss/i }))

  expect(screen.queryByRole('dialog', { name: /map configuration/i })).not.toBeInTheDocument()
})

test('saves and closes local configuration panel when uncontrolled', () => {
  render(<WsprMap features={[]} />)

  fireEvent.click(screen.getByRole('button', { name: /open map configuration/i }))
  fireEvent.change(screen.getByRole('textbox', { name: /callsign/i }), { target: { value: 'vk2djj' } })
  fireEvent.click(screen.getByRole('button', { name: /save configuration/i }))

  expect(screen.queryByRole('dialog', { name: /map configuration/i })).not.toBeInTheDocument()
})

test('filters WSPR paths by configured bands', async () => {
  render(<WsprMap features={[feature, fortyMeterFeature]} userConfig={configWithBands(['20m'])} />)
  act(() => mocks.loadHandler?.())

  await waitFor(() => expect(deckMocks.setProps).toHaveBeenCalled())
  const pathLayer = latestDeckLayer('wspr-deck-paths') as DeckLayer & { props: { data: Array<{ pathId: string }> } }
  expect([...new Set(pathLayer.props.data.map((path) => path.pathId))]).toEqual(['1'])
})

test('shows an active-band empty state for unknown bands', async () => {
  render(<WsprMap features={[fortyMeterFeature]} userConfig={configWithBands(['20m'])} />)
  mocks.loadHandler?.()

  expect(await screen.findByText(/no wspr paths match the active filters/i)).toBeInTheDocument()
})

test('filters WSPR paths by configured spot and heard visibility', async () => {
  render(<WsprMap features={[feature, heardFeature]} userConfig={{
    ...defaultUserConfig(),
    activityVisibility: { showSpots: false, showHeard: true },
  }} />)
  act(() => mocks.loadHandler?.())

  await waitFor(() => expect(deckMocks.setProps).toHaveBeenCalled())
  const pathLayer = latestDeckLayer('wspr-deck-paths') as DeckLayer & { props: { data: Array<{ pathId: string }> } }
  expect(pathLayer.props.data.map((path) => path.pathId)).toEqual(['heard'])
})

test('shows an active-filter empty state when activity visibility hides all paths', async () => {
  render(<WsprMap features={[feature]} userConfig={{
    ...defaultUserConfig(),
    activityVisibility: { showSpots: false, showHeard: true },
  }} />)
  mocks.loadHandler?.()

  expect(await screen.findByText(/no wspr paths match the active filters/i)).toBeInTheDocument()
})

test('does not filter paths when bands are Mixed', async () => {
  render(<WsprMap features={[feature, fortyMeterFeature]} userConfig={defaultUserConfig()} />)
  mocks.loadHandler?.()

  await waitFor(() => expect(deckMocks.setProps).toHaveBeenCalled())
  const pathLayer = latestDeckLayer('wspr-deck-paths') as DeckLayer & { props: { data: Array<{ pathId: string }> } }
  expect([...new Set(pathLayer.props.data.map((path) => path.pathId))]).toEqual(['1', '2'])
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

test('keeps WSPR path lines non-interactive', async () => {
  render(<WsprMap features={[feature]} />)
  mocks.loadHandler?.()
  await waitFor(() => expect(deckMocks.setProps).toHaveBeenCalled())

  const pathLayer = latestDeckLayer('wspr-deck-paths') as DeckLayer & {
    props: { pickable: boolean; onClick?: unknown }
  }

  expect(pathLayer.props.pickable).toBe(false)
  expect(pathLayer.props.onClick).toBeUndefined()
  expect(screen.queryByLabelText(/selected wspr activity details/i)).not.toBeInTheDocument()
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

test('uses deck.gl path accessors with great-circle arcs', async () => {
  render(<WsprMap features={[feature]} />)
  mocks.loadHandler?.()
  await waitFor(() => expect(deckMocks.setProps).toHaveBeenCalled())

  const pathLayer = latestDeckLayer('wspr-deck-paths') as DeckLayer & {
    props: {
      getPath: (path: { arc: unknown }) => unknown
      getColor: (path: { activityRole: 'transmitter' | 'receiver' | 'both'; opacity: number }) => number[]
      getWidth: number
      data: Array<{ arc: [number, number][] }>
    }
  }
  const layerProps = pathLayer.props

  expect(layerProps.getPath({ arc: layerProps.data[0].arc })).toBe(layerProps.data[0].arc)
  expect(layerProps.data[0].arc.length).toBeGreaterThan(2)
  expect(layerProps.data[0].arc[0]).toEqual(feature.geometry.coordinates[0])
  expect(layerProps.data[0].arc[layerProps.data[0].arc.length - 1]).toEqual(feature.geometry.coordinates[1])
  expect(layerProps.getColor({ activityRole: 'transmitter', opacity: 1 })).toEqual([255, 154, 162, 230])
  expect(layerProps.getColor({ activityRole: 'receiver', opacity: 1 })).toEqual([170, 225, 170, 230])
  expect(layerProps.getColor({ activityRole: 'both', opacity: 1 })).toEqual([255, 222, 122, 230])
  expect(layerProps.getWidth).toBe(1.5)
})

test('renders animated pulse dots along WSPR paths', async () => {
  render(<WsprMap features={[feature]} />)
  mocks.loadHandler?.()
  await waitFor(() => expect(deckMocks.setProps).toHaveBeenCalled())

  const pulseLayer = latestDeckLayer('wspr-deck-pulse') as DeckLayer & {
    props: {
      data: Array<{ position: [number, number]; activityRole: 'transmitter' | 'receiver' | 'both'; opacity: number }>
      getPosition: (dot: { position: [number, number] }) => [number, number]
      getFillColor: (dot: { activityRole: 'transmitter'; opacity: number }) => number[]
      getRadius: number
      pickable: boolean
    }
  }

  expect(pulseLayer.props.data).toHaveLength(1)
  expect(pulseLayer.props.getPosition(pulseLayer.props.data[0])).toEqual(pulseLayer.props.data[0].position)
  expect(pulseLayer.props.getFillColor({ activityRole: 'transmitter', opacity: 1 })).toBeTruthy()
  expect(pulseLayer.props.getRadius).toBe(3)
  expect(pulseLayer.props.pickable).toBe(false)
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
    'wspr-deck-pulse',
    'wspr-deck-endpoints',
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

test('renders circles at each WSPR path endpoint', async () => {
  render(<WsprMap features={[feature]} />)
  mocks.loadHandler?.()

  await waitFor(() => expect(deckMocks.setProps).toHaveBeenCalled())
  const endpointLayer = latestDeckLayer('wspr-deck-endpoints') as DeckLayer & {
    props: {
      data: Array<{ id: string; pathId: string; coordinates: [number, number] }>
      getPosition: (endpoint: { coordinates: [number, number] }) => [number, number]
      getFillColor: number[]
      getLineColor: (endpoint: { activityRole: 'transmitter' | 'receiver' | 'both'; opacity: number }) => number[]
      getRadius: number
      radiusUnits: string
      stroked: boolean
      filled: boolean
      pickable: boolean
    }
  }

  expect(endpointLayer.props.data).toEqual([
    { id: '1-start', pathId: '1', coordinates: [151.2, -33.8], endpoint: 'start', station: 'VK2DJJ', stationRole: 'tx', activityRole: 'transmitter', opacity: expect.any(Number) },
    { id: '1-end', pathId: '1', coordinates: [144.9, -37.8], endpoint: 'end', station: 'VK3ABC', stationRole: 'rx', activityRole: 'transmitter', opacity: expect.any(Number) },
  ])
  expect(endpointLayer.props.getPosition(endpointLayer.props.data[0])).toEqual([151.2, -33.8])
  expect(endpointLayer.props.getFillColor).toEqual([255, 255, 255, 0])
  expect(endpointLayer.props.getLineColor({ activityRole: 'transmitter', opacity: 1 })).toEqual([255, 154, 162, 230])
  expect(endpointLayer.props.getLineColor({ activityRole: 'receiver', opacity: 1 })).toEqual([170, 225, 170, 230])
  expect(endpointLayer.props.getRadius).toBe(4)
  expect(endpointLayer.props.radiusUnits).toBe('pixels')
  expect(endpointLayer.props.stroked).toBe(true)
  expect(endpointLayer.props.filled).toBe(false)
  expect(endpointLayer.props.pickable).toBe(true)
})

test('fades old WSPR activity based on configured request window', async () => {
  vi.useFakeTimers()
  vi.setSystemTime(new Date('2026-05-16T12:30:00Z'))
  render(<WsprMap features={[feature]} userConfig={{ ...defaultUserConfig(), requestWindow: { amount: 2, unit: 'hours' } }} />)
  act(() => mocks.loadHandler?.())

  expect(deckMocks.setProps).toHaveBeenCalled()
  const pathLayer = latestDeckLayer('wspr-deck-paths') as DeckLayer & {
    props: {
      data: Array<{ activityRole: 'transmitter' | 'receiver' | 'both'; opacity: number }>
      getColor: (path: { activityRole: 'transmitter' | 'receiver' | 'both'; opacity: number }) => number[]
    }
  }
  const endpointLayer = latestDeckLayer('wspr-deck-endpoints') as DeckLayer & {
    props: {
      data: Array<{ activityRole: 'transmitter' | 'receiver' | 'both'; opacity: number }>
      getLineColor: (endpoint: { activityRole: 'transmitter' | 'receiver' | 'both'; opacity: number }) => number[]
    }
  }

  expect(pathLayer.props.data[0].opacity).toBeCloseTo(0.08)
  expect(pathLayer.props.getColor(pathLayer.props.data[0])).toEqual([255, 154, 162, 18])
  expect(endpointLayer.props.getLineColor(endpointLayer.props.data[0])).toEqual([255, 154, 162, 18])
})

test('treats timezone-less WSPR timestamps as UTC when fading by age', async () => {
  vi.useFakeTimers()
  vi.setSystemTime(new Date('2026-05-16T11:30:00Z'))
  const utcFeature: ActivityFeature = {
    ...feature,
    properties: { ...feature.properties, time: '2026-05-16T10:30:00' },
  }
  render(<WsprMap features={[utcFeature]} userConfig={{ ...defaultUserConfig(), requestWindow: { amount: 2, unit: 'hours' } }} />)
  act(() => mocks.loadHandler?.())

  expect(deckMocks.setProps).toHaveBeenCalled()
  const pathLayer = latestDeckLayer('wspr-deck-paths') as DeckLayer & {
    props: { data: Array<{ opacity: number }> }
  }

  expect(pathLayer.props.data[0].opacity).toBeCloseTo(0.5)
})

test('keeps activity prominent when its timestamp cannot be parsed', async () => {
  const invalidTimeFeature: ActivityFeature = {
    ...feature,
    properties: { ...feature.properties, time: 'not-a-date' },
  }
  render(<WsprMap features={[invalidTimeFeature]} userConfig={{ ...defaultUserConfig(), requestWindow: { amount: 1, unit: 'hours' } }} />)
  act(() => mocks.loadHandler?.())

  await waitFor(() => expect(deckMocks.setProps).toHaveBeenCalled())
  const pathLayer = latestDeckLayer('wspr-deck-paths') as DeckLayer & {
    props: { data: Array<{ opacity: number }> }
  }

  expect(pathLayer.props.data[0].opacity).toBe(1)
})

test('colors spotted activity red and heard activity green', async () => {
  const bothFeature: ActivityFeature = {
    ...feature,
    id: 'both',
    properties: { ...feature.properties, role: 'both' },
  }
  render(<WsprMap features={[feature, heardFeature, bothFeature]} />)
  act(() => mocks.loadHandler?.())

  await waitFor(() => expect(deckMocks.setProps).toHaveBeenCalled())
  const pathLayer = latestDeckLayer('wspr-deck-paths') as DeckLayer & {
    props: {
      data: Array<{ id: string; activityRole: 'transmitter' | 'receiver' | 'both'; opacity: number }>
      getColor: (path: { activityRole: 'transmitter' | 'receiver' | 'both'; opacity: number }) => number[]
    }
  }

  expect(pathLayer.props.data.map((segment) => segment.id)).toEqual(['1', 'heard', 'both'])
  expect(pathLayer.props.getColor({ ...pathLayer.props.data[0], opacity: 1 })).toEqual([255, 154, 162, 230])
  expect(pathLayer.props.getColor({ ...pathLayer.props.data[1], opacity: 1 })).toEqual([170, 225, 170, 230])
  expect(pathLayer.props.getColor({ ...pathLayer.props.data[2], opacity: 1 })).toEqual([255, 222, 122, 230])
})

test('keeps endpoint stations oriented when the active callsign is the receiver', async () => {
  render(<WsprMap features={[feature]} activeCallsign="VK3ABC" />)
  act(() => mocks.loadHandler?.())

  await waitFor(() => expect(deckMocks.setProps).toHaveBeenCalled())
  const pathLayer = latestDeckLayer('wspr-deck-paths') as DeckLayer & {
    props: { data: Array<{ id: string; activityRole: 'transmitter' | 'receiver' | 'both' }> }
  }
  const endpointLayer = latestDeckLayer('wspr-deck-endpoints') as DeckLayer & {
    props: { data: Array<{ station: string; stationRole: 'tx' | 'rx' }> }
  }

  expect(pathLayer.props.data).toEqual([expect.objectContaining({ id: '1', activityRole: 'transmitter' })])
  expect(endpointLayer.props.data).toEqual([
    expect.objectContaining({ station: 'VK3ABC', stationRole: 'rx' }),
    expect.objectContaining({ station: 'VK2DJJ', stationRole: 'tx' }),
  ])
})

test('shows dismissible contact details when clicking a WSPR endpoint circle', async () => {
  render(<WsprMap features={[feature]} />)
  act(() => mocks.loadHandler?.())

  await waitFor(() => expect(deckMocks.setProps).toHaveBeenCalled())
  const endpointLayer = latestDeckLayer('wspr-deck-endpoints') as DeckLayer & {
    props: {
      data: Array<{ id: string; pathId: string; coordinates: [number, number]; station: string }>
      onClick: (info: { object: { id: string; pathId: string; coordinates: [number, number]; station: string } | null }) => void
    }
  }

  act(() => endpointLayer.props.onClick({ object: endpointLayer.props.data[0] }))

  const details = screen.getByLabelText(/selected wspr activity details/i)
  expect(details).toHaveTextContent('VK2DJJ to VK3ABC')
  expect(details).toHaveTextContent('20m')
  expect(details).toHaveTextContent('-18 dB')
  fireEvent.click(screen.getByRole('button', { name: /close/i }))

  expect(screen.queryByLabelText(/selected wspr activity details/i)).not.toBeInTheDocument()
})

test('uses fallback contact details when clicking incomplete WSPR data', async () => {
  const incompleteFeature: ActivityFeature = {
    ...feature,
    properties: { ...feature.properties, band: null, snr_db: null },
  }
  render(<WsprMap features={[incompleteFeature]} />)
  act(() => mocks.loadHandler?.())

  await waitFor(() => expect(deckMocks.setProps).toHaveBeenCalled())
  const endpointLayer = latestDeckLayer('wspr-deck-endpoints') as DeckLayer & {
    props: {
      data: Array<{ id: string; pathId: string; coordinates: [number, number]; station: string }>
      onClick: (info: { object: { id: string; pathId: string; coordinates: [number, number]; station: string } | null }) => void
    }
  }

  act(() => endpointLayer.props.onClick({ object: endpointLayer.props.data[1] }))

  const details = screen.getByLabelText(/selected wspr activity details/i)
  expect(details).toHaveTextContent('Unknown')
  expect(details).toHaveTextContent('Unknown dB')
})

test('keeps the map usable when the initial grayline cannot be created', async () => {
  vi.spyOn(terminatorService, 'createGraylineTerminator').mockImplementationOnce(() => {
    throw new Error('blocked')
  })
  render(<WsprMap features={[]} />)
  act(() => mocks.loadHandler?.())

  expect(screen.getByLabelText(/world map/i)).toBeInTheDocument()
  expect(latestDeckLayers().map((layer) => layer.props.id)).toEqual(['wspr-deck-paths', 'wspr-deck-endpoints'])
})

test('refreshes grayline every five visible minutes and preserves selected endpoint details', async () => {
  vi.useFakeTimers()
  mockVisibilityState('visible')
  vi.setSystemTime(new Date('2026-05-18T00:00:00Z'))
  render(<WsprMap features={[feature]} baseLayerId="carto-positron" activeCallsign="VK2DJJ" />)
  act(() => mocks.loadHandler?.())
  expect(deckMocks.setProps).toHaveBeenCalled()
  const initialGrayline = latestDeckLayer('grayline-terminator-line') as DeckLayer & {
    props: { data: Array<{ observationTime: string }> }
  }
  const endpointLayer = latestDeckLayer('wspr-deck-endpoints') as DeckLayer & {
    props: {
      data: Array<{ pathId: string }>
      onClick: (info: { object: { pathId: string } | null }) => void
    }
  }
  act(() => endpointLayer.props.onClick({ object: endpointLayer.props.data[0] }))
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
