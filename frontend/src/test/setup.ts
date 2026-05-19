// SPDX-License-Identifier: AGPL-3.0-only
import '@testing-library/jest-dom/vitest'

const maplibreMocks = {
  addControl: vi.fn(),
  addLayer: vi.fn(),
  addSource: vi.fn(),
  canvas: document.createElement('canvas'),
  extend: vi.fn(),
  fitBounds: vi.fn(),
  getCanvas: vi.fn(() => maplibreMocks.canvas),
  getContainer: vi.fn(() => document.createElement('div')),
  getSource: vi.fn(),
  getCenter: vi.fn(() => ({ lng: 151, lat: -34 })),
  getZoom: vi.fn(() => 4),
  remove: vi.fn(),
  setData: vi.fn(),
  setStyle: vi.fn(),
  loadHandler: undefined as (() => void) | undefined,
  moveEndHandler: undefined as (() => void) | undefined,
  sourceDataHandler: undefined as (() => void) | undefined,
  styleDataHandler: undefined as (() => void) | undefined,
}

const deckMocks = {
  finalize: vi.fn(),
  setProps: vi.fn(),
}

vi.mock('maplibre-gl', () => {
  class MapMock {
    addControl = maplibreMocks.addControl
    addLayer = maplibreMocks.addLayer
    addSource = maplibreMocks.addSource
    fitBounds = maplibreMocks.fitBounds
    getCanvas = maplibreMocks.getCanvas
    getCenter = maplibreMocks.getCenter
    getContainer = maplibreMocks.getContainer
    getSource = maplibreMocks.getSource
    getZoom = maplibreMocks.getZoom
    remove = maplibreMocks.remove
    setStyle = maplibreMocks.setStyle

    on(event: string, handler: () => void) {
      if (event === 'load') maplibreMocks.loadHandler = handler
      if (event === 'moveend') maplibreMocks.moveEndHandler = handler
      if (event === 'sourcedata') maplibreMocks.sourceDataHandler = handler
      if (event === 'styledata') maplibreMocks.styleDataHandler = handler
    }
  }

  class LngLatBoundsMock {
    start: [number, number]
    end: [number, number]
    extend = maplibreMocks.extend

    constructor(start: [number, number], end: [number, number]) {
      this.start = start
      this.end = end
    }
  }

  class AttributionControlMock {
    options: unknown

    constructor(options: unknown) {
      this.options = options
    }
  }

  return {
      default: {
        Map: MapMock,
      AttributionControl: AttributionControlMock,
      LngLatBounds: LngLatBoundsMock,
      __mocks: maplibreMocks,
    },
  }
})

vi.mock('@deck.gl/mapbox', () => {
  class MapboxOverlayMock {
    finalize = deckMocks.finalize
    setProps = deckMocks.setProps
  }

  return { MapboxOverlay: MapboxOverlayMock, __mocks: deckMocks }
})

vi.mock('@deck.gl/layers', () => ({
  PathLayer: class PathLayerMock {
    props: unknown
    constructor(props: unknown) {
      this.props = props
    }
  },
  PolygonLayer: class PolygonLayerMock {
    props: unknown
    constructor(props: unknown) {
      this.props = props
    }
  },
  ScatterplotLayer: class ScatterplotLayerMock {
    props: unknown
    constructor(props: unknown) {
      this.props = props
    }
  },
}))
