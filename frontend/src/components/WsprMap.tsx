import 'maplibre-gl/dist/maplibre-gl.css'
import maplibregl, {
  type GeoJSONSource,
  type Map as MapLibreMap,
  type StyleSpecification,
} from 'maplibre-gl'
import { useEffect, useMemo, useRef, useState } from 'react'
import type { ActivityFeature } from '../services/wsprActivity'
import { toMapPaths } from '../services/mapFeatures'
import { ActivityDetails } from './ActivityDetails'

type WsprMapProps = {
  features: ActivityFeature[]
  truncated?: boolean
}

const pathSourceId = 'wspr-paths-source'
const pathLayerId = 'wspr-paths'

const worldStyle: StyleSpecification = {
  version: 8,
  sources: {
    osm: {
      type: 'raster',
      tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
      tileSize: 256,
      attribution: '© OpenStreetMap contributors',
    },
  },
  layers: [{ id: 'osm', type: 'raster', source: 'osm' }],
}

function toFeatureCollection(features: ActivityFeature[]) {
  return {
    type: 'FeatureCollection' as const,
    features,
  }
}

function boundsFor(features: ActivityFeature[]) {
  const coordinates = features.flatMap((feature) => feature.geometry.coordinates)
  if (coordinates.length === 0) return null

  const bounds = new maplibregl.LngLatBounds(coordinates[0], coordinates[0])
  coordinates.slice(1).forEach((coordinate) => bounds.extend(coordinate))
  return bounds
}

export function WsprMap({ features, truncated = false }: WsprMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<MapLibreMap | null>(null)
  const [mapReady, setMapReady] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const paths = useMemo(() => toMapPaths(features), [features])
  const selected = features.find((feature) => feature.id === selectedId) ?? null

  useEffect(() => {
    const map = new maplibregl.Map({
      container: containerRef.current!,
      style: worldStyle,
      center: [133, -27],
      zoom: 1.8,
    })
    mapRef.current = map
    map.addControl(new maplibregl.NavigationControl(), 'top-right')
    map.on('load', () => setMapReady(true))

    return () => {
      map.remove()
      mapRef.current = null
    }
  }, [])

  useEffect(() => {
    const map = mapRef.current
    if (!map || !mapReady) return

    const collection = toFeatureCollection(features)
    const existingSource = map.getSource(pathSourceId) as GeoJSONSource | undefined

    if (existingSource) {
      existingSource.setData(collection)
    } else {
      map.addSource(pathSourceId, { type: 'geojson', data: collection })
      map.addLayer({
        id: pathLayerId,
        type: 'line',
        source: pathSourceId,
        paint: {
          'line-color': '#68d3ff',
          'line-width': 2.5,
          'line-opacity': 0.86,
        },
      })
    }

    const bounds = boundsFor(features)
    if (bounds) {
      map.fitBounds(bounds, { padding: 56, maxZoom: 5, duration: 500 })
    }
  }, [features, mapReady])

  return (
    <div className="wspr-map" aria-label="WSPR path map">
      {truncated ? (
        <p className="map-notice" role="status">
          Showing only the most recent 1,000 records.
        </p>
      ) : null}
      {paths.length === 0 ? <p>No map paths to display.</p> : null}
      <div ref={containerRef} className="map-canvas" role="application" aria-label="World map" />
      <div className="path-list" aria-label="Mapped WSPR paths">
        {paths.map((path) => (
          <button
            key={path.id}
            type="button"
            className={selectedId === path.id ? 'path-button selected' : 'path-button'}
            onClick={() => setSelectedId(path.id)}
          >
            {path.label}
          </button>
        ))}
      </div>
      <ActivityDetails feature={selected} />
    </div>
  )
}
