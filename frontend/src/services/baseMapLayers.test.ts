// SPDX-License-Identifier: AGPL-3.0-only
import {
  BASE_MAP_LAYERS,
  baseMapStorageKey,
  defaultBaseMapLayer,
  findBaseMapLayer,
  readStoredBaseMapLayer,
  saveBaseMapLayer,
} from './baseMapLayers'

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

test('provides the required open base map catalog', () => {
  expect(BASE_MAP_LAYERS.map((layer) => layer.name)).toEqual([
    'OpenStreetMap Standard',
    'OpenTopoMap',
    'OpenStreetMap Humanitarian',
    'CARTO Positron',
    'CARTO Dark Matter',
    'CARTO Voyager',
  ])
  expect(BASE_MAP_LAYERS.every((layer) => layer.attribution && layer.usageNotes && layer.tiles.length > 0)).toBe(true)
})

test('finds layers and falls back to the default layer', () => {
  expect(defaultBaseMapLayer().id).toBe('carto-dark-matter')
  expect(findBaseMapLayer('opentopomap').name).toBe('OpenTopoMap')
  expect(findBaseMapLayer('missing' as never).id).toBe('carto-dark-matter')
})

test('persists and safely reads the selected base map layer', () => {
  expect(readStoredBaseMapLayer()).toBe('carto-dark-matter')

  saveBaseMapLayer('carto-dark-matter')
  expect(window.localStorage.getItem(baseMapStorageKey())).toBe('carto-dark-matter')
  expect(readStoredBaseMapLayer()).toBe('carto-dark-matter')

  window.localStorage.setItem(baseMapStorageKey(), 'missing')
  expect(readStoredBaseMapLayer()).toBe('carto-dark-matter')

  expect(readStoredBaseMapLayer(throwingStorage())).toBe('carto-dark-matter')
  expect(() => saveBaseMapLayer('carto-voyager', throwingStorage())).not.toThrow()
})
