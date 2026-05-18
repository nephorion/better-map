// SPDX-License-Identifier: AGPL-3.0-only
export type BaseMapLayer = {
  id: 'osm-standard' | 'opentopomap' | 'osm-humanitarian' | 'carto-positron' | 'carto-dark-matter' | 'carto-voyager'
  name: string
  tiles: string[]
  attribution: string
  usageNotes: string
  isDefault?: boolean
}

export const BASE_MAP_LAYERS: BaseMapLayer[] = [
  {
    id: 'osm-standard',
    name: 'OpenStreetMap Standard',
    tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
    attribution: '© OpenStreetMap contributors',
    usageNotes: 'Uses OpenStreetMap public tiles with visible attribution and fair-use limits.',
  },
  {
    id: 'opentopomap',
    name: 'OpenTopoMap',
    tiles: ['https://tile.opentopomap.org/{z}/{x}/{y}.png'],
    attribution: '© OpenStreetMap contributors, SRTM | © OpenTopoMap (CC-BY-SA)',
    usageNotes: 'Suitable for topographic context; public tile usage should remain modest.',
  },
  {
    id: 'osm-humanitarian',
    name: 'OpenStreetMap Humanitarian',
    tiles: ['https://tile-a.openstreetmap.fr/hot/{z}/{x}/{y}.png'],
    attribution: '© OpenStreetMap contributors, Tiles style by Humanitarian OpenStreetMap Team',
    usageNotes: 'Humanitarian style tiles require attribution and responsible public tile use.',
  },
  {
    id: 'carto-positron',
    name: 'CARTO Positron',
    tiles: ['https://a.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png'],
    attribution: '© OpenStreetMap contributors © CARTO',
    usageNotes: 'Light CARTO basemap suitable for overlay-heavy map views with required attribution.',
  },
  {
    id: 'carto-dark-matter',
    name: 'CARTO Dark Matter',
    tiles: ['https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png'],
    attribution: '© OpenStreetMap contributors © CARTO',
    usageNotes: 'Dark CARTO basemap for high-contrast WSPR paths with required attribution.',
    isDefault: true,
  },
  {
    id: 'carto-voyager',
    name: 'CARTO Voyager',
    tiles: ['https://a.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png'],
    attribution: '© OpenStreetMap contributors © CARTO',
    usageNotes: 'Detailed CARTO basemap with labels and required attribution.',
  },
]

const BASE_MAP_STORAGE_KEY = 'better-map.baseMapLayer'

export function defaultBaseMapLayer() {
  return BASE_MAP_LAYERS.find((layer) => layer.isDefault) ?? BASE_MAP_LAYERS[0]
}

export function findBaseMapLayer(id: BaseMapLayer['id']) {
  return BASE_MAP_LAYERS.find((layer) => layer.id === id) ?? defaultBaseMapLayer()
}

export function baseMapStorageKey() {
  return BASE_MAP_STORAGE_KEY
}

export function readStoredBaseMapLayer(storage: Storage = window.localStorage) {
  try {
    const id = storage.getItem(BASE_MAP_STORAGE_KEY) as BaseMapLayer['id'] | null
    return id ? findBaseMapLayer(id).id : defaultBaseMapLayer().id
  } catch {
    return defaultBaseMapLayer().id
  }
}

export function saveBaseMapLayer(id: BaseMapLayer['id'], storage: Storage = window.localStorage) {
  try {
    storage.setItem(BASE_MAP_STORAGE_KEY, findBaseMapLayer(id).id)
  } catch {
    // Base-map persistence is best-effort and should not block layer changes.
  }
}
