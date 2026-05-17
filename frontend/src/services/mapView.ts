export type StoredMapView = {
  center: [number, number]
  zoom: number
}

const MAP_VIEW_KEY = 'better-map.mapView'
const DEFAULT_VIEW: StoredMapView = { center: [133, -27], zoom: 1.8 }

export function mapViewStorageKey() {
  return MAP_VIEW_KEY
}

export function defaultMapView() {
  return DEFAULT_VIEW
}

export function readStoredMapView(storage: Storage = window.localStorage): StoredMapView {
  try {
    const raw = storage.getItem(MAP_VIEW_KEY)
    if (!raw) return DEFAULT_VIEW
    const parsed = JSON.parse(raw) as Partial<StoredMapView>
    const [lng, lat] = parsed.center ?? []
    if (
      typeof lng !== 'number' ||
      typeof lat !== 'number' ||
      typeof parsed.zoom !== 'number' ||
      lng < -180 ||
      lng > 180 ||
      lat < -90 ||
      lat > 90 ||
      parsed.zoom < 0
    ) {
      return DEFAULT_VIEW
    }
    return { center: [lng, lat], zoom: parsed.zoom }
  } catch {
    return DEFAULT_VIEW
  }
}

export function saveMapView(view: StoredMapView, storage: Storage = window.localStorage) {
  try {
    storage.setItem(MAP_VIEW_KEY, JSON.stringify(view))
  } catch {
    // Map view persistence is best-effort and should never interrupt map interaction.
  }
}
