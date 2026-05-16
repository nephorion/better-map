import '@testing-library/jest-dom/vitest'

const maplibreMocks = {
  addControl: vi.fn(),
  addLayer: vi.fn(),
  addSource: vi.fn(),
  extend: vi.fn(),
  fitBounds: vi.fn(),
  getSource: vi.fn(),
  remove: vi.fn(),
  setData: vi.fn(),
  loadHandler: undefined as (() => void) | undefined,
}

vi.mock('maplibre-gl', () => {
  class MapMock {
    addControl = maplibreMocks.addControl
    addLayer = maplibreMocks.addLayer
    addSource = maplibreMocks.addSource
    fitBounds = maplibreMocks.fitBounds
    getSource = maplibreMocks.getSource
    remove = maplibreMocks.remove

    on(_event: string, handler: () => void) {
      maplibreMocks.loadHandler = handler
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

  return {
    default: {
      Map: MapMock,
      NavigationControl: class NavigationControlMock {},
      LngLatBounds: LngLatBoundsMock,
      __mocks: maplibreMocks,
    },
  }
})
