import 'maplibre-gl/dist/maplibre-gl.css'
import { MapboxOverlay } from '@deck.gl/mapbox'
import { PathLayer } from '@deck.gl/layers'
import maplibregl, {
  type Map as MapLibreMap,
  type StyleSpecification,
} from 'maplibre-gl'
import { useEffect, useMemo, useRef, useState } from 'react'
import type { ActivityFeature } from '../services/wsprActivity'
import { toMapPaths } from '../services/mapFeatures'
import { ActivityDetails } from './ActivityDetails'
import { defaultBaseMapLayer, findBaseMapLayer, type BaseMapLayer } from '../services/baseMapLayers'
import { readStoredMapView, saveMapView } from '../services/mapView'

type WsprMapProps = {
  features: ActivityFeature[]
  truncated?: boolean
  baseLayerId?: BaseMapLayer['id']
  activeCallsign?: string | null
}

function worldStyle(layer: BaseMapLayer): StyleSpecification {
  return {
    version: 8,
    sources: {
      base: {
        type: 'raster',
        tiles: layer.tiles,
        tileSize: 256,
        attribution: layer.attribution,
      },
    },
    layers: [{ id: 'base', type: 'raster', source: 'base' }],
  }
}

export function WsprMap({ features, baseLayerId = 'osm-standard', activeCallsign = null }: WsprMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<MapLibreMap | null>(null)
  const deckOverlayRef = useRef<MapboxOverlay | null>(null)
  const [mapReady, setMapReady] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const paths = useMemo(() => toMapPaths(features, activeCallsign), [activeCallsign, features])
  const activeSelectedId = features.some((feature) => feature.id === selectedId) ? selectedId : null
  const selected = features.find((feature) => feature.id === activeSelectedId) ?? null
  const baseLayer = findBaseMapLayer(baseLayerId)

  useEffect(() => {
    const storedView = readStoredMapView()
    const map = new maplibregl.Map({
      container: containerRef.current!,
      style: worldStyle(defaultBaseMapLayer()),
      center: storedView.center,
      zoom: storedView.zoom,
    })
    const deckOverlay = new MapboxOverlay({ interleaved: false, layers: [] })
    mapRef.current = map
    deckOverlayRef.current = deckOverlay
    map.addControl(deckOverlay)
    map.on('load', () => setMapReady(true))
    map.on('moveend', () => {
      const center = map.getCenter()
      saveMapView({ center: [center.lng, center.lat], zoom: map.getZoom() })
    })

    return () => {
      deckOverlay.finalize()
      map.remove()
      mapRef.current = null
      deckOverlayRef.current = null
    }
  }, [])

  useEffect(() => {
    const map = mapRef.current
    if (!map || !mapReady) return
    map.setStyle(worldStyle(baseLayer))
  }, [baseLayer, mapReady])

  useEffect(() => {
    const map = mapRef.current
    const deckOverlay = deckOverlayRef.current
    if (!map || !deckOverlay || !mapReady) return

    deckOverlay.setProps({
      layers: [
        new PathLayer({
          id: 'wspr-deck-paths',
          data: paths,
          getPath: (path) => path.coordinates,
          getColor: (path) => (path.id === activeSelectedId ? [255, 222, 122, 245] : [104, 211, 255, 220]),
          getWidth: (path) => (path.id === activeSelectedId ? 5 : 3),
          widthMinPixels: 2,
          pickable: true,
          autoHighlight: true,
          onClick: (info) => {
            if (info.object) setSelectedId(info.object.id)
          },
        }),
      ],
    })
  }, [activeSelectedId, mapReady, paths])

  return (
    <div className="wspr-map" aria-label="WSPR path map">
      {paths.length === 0 ? <p>No map paths to display.</p> : null}
      <div ref={containerRef} className="map-canvas" role="application" aria-label="World map" />
      <ActivityDetails feature={selected} onClose={() => setSelectedId(null)} />
    </div>
  )
}
