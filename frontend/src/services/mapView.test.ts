// SPDX-License-Identifier: AGPL-3.0-only
import { defaultMapView, mapViewStorageKey, readStoredMapView, saveMapView } from './mapView'

function throwingStorage(): Storage {
  return {
    length: 0,
    clear: vi.fn(),
    getItem: vi.fn(() => { throw new Error('blocked') }),
    key: vi.fn(),
    removeItem: vi.fn(),
    setItem: vi.fn(() => { throw new Error('blocked') }),
  }
}

test('reads, validates, and saves map view state', () => {
  expect(readStoredMapView()).toEqual(defaultMapView())

  saveMapView({ center: [12, 34], zoom: 5 })
  expect(JSON.parse(window.localStorage.getItem(mapViewStorageKey()) ?? '{}')).toEqual({ center: [12, 34], zoom: 5 })
  expect(readStoredMapView()).toEqual({ center: [12, 34], zoom: 5 })
})

test('falls back for invalid or unavailable map view storage', () => {
  window.localStorage.setItem(mapViewStorageKey(), '{')
  expect(readStoredMapView()).toEqual(defaultMapView())

  window.localStorage.setItem(mapViewStorageKey(), JSON.stringify({ center: [999, 34], zoom: 5 }))
  expect(readStoredMapView()).toEqual(defaultMapView())

  expect(readStoredMapView(throwingStorage())).toEqual(defaultMapView())
  expect(() => saveMapView({ center: [1, 2], zoom: 3 }, throwingStorage())).not.toThrow()
})
