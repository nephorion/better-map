// SPDX-License-Identifier: AGPL-3.0-only
import 'maplibre-gl/dist/maplibre-gl.css'
import { MapboxOverlay } from '@deck.gl/mapbox'
import { PathLayer, PolygonLayer } from '@deck.gl/layers'
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
import * as terminatorService from '../services/terminator'

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

function collapseAttribution(map: MapLibreMap) {
  const attribution = map.getContainer().querySelector('.maplibregl-ctrl-attrib')
  attribution?.removeAttribute('open')
  attribution?.classList.remove('maplibregl-compact-show')
}

export function WsprMap({ features, baseLayerId = 'osm-standard', activeCallsign = null }: WsprMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<MapLibreMap | null>(null)
  const deckOverlayRef = useRef<MapboxOverlay | null>(null)
  const [mapReady, setMapReady] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [grayline, setGrayline] = useState(() => {
    try {
      return terminatorService.createGraylineTerminator(new Date())
    } catch {
      return null
    }
  })
  const lastGraylineRefreshRef = useRef(grayline ? Date.parse(grayline.lastUpdatedAt) : 0)
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
      attributionControl: false,
    })
    const deckOverlay = new MapboxOverlay({ interleaved: false, layers: [] })
    mapRef.current = map
    deckOverlayRef.current = deckOverlay
    map.addControl(deckOverlay)
    map.addControl(new maplibregl.AttributionControl({ compact: true }))
    collapseAttribution(map)
    map.on('load', () => setMapReady(true))
    map.on('styledata', () => collapseAttribution(map))
    map.on('sourcedata', () => collapseAttribution(map))
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

    const graylineLayers = grayline
      ? [
        new PolygonLayer({
          id: 'grayline-terminator-overlay',
          data: grayline.darknessRegion,
          getPolygon: (polygon) => polygon,
          getFillColor: [8, 12, 22, 56],
          stroked: false,
          filled: true,
          pickable: false,
        }),
        new PathLayer({
          id: 'grayline-terminator-line',
          data: grayline.renderedBoundaryPaths.map((path) => ({ observationTime: grayline.observationTime, path })),
          getPath: (segment) => segment.path,
          getColor: [210, 214, 224, 130],
          getWidth: 1,
          widthMinPixels: 1,
          pickable: false,
        }),
      ]
      : []

    deckOverlay.setProps({
      layers: [
        ...graylineLayers,
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
  }, [activeSelectedId, grayline, mapReady, paths])

  useEffect(() => {
    function refreshGrayline() {
      const now = new Date()
      try {
        setGrayline(terminatorService.createGraylineTerminator(now))
        lastGraylineRefreshRef.current = now.getTime()
      } catch {
        // Keep the previous overlay and retry on the next scheduled refresh.
      }
    }

    const intervalId = window.setInterval(() => {
      if (document.visibilityState === 'visible') refreshGrayline()
    }, terminatorService.GRAYLINE_REFRESH_INTERVAL_MS)

    function refreshWhenVisible() {
      if (document.visibilityState !== 'visible') return
      if (Date.now() - lastGraylineRefreshRef.current >= terminatorService.STALE_VISIBILITY_REFRESH_MS) refreshGrayline()
    }

    document.addEventListener('visibilitychange', refreshWhenVisible)
    return () => {
      window.clearInterval(intervalId)
      document.removeEventListener('visibilitychange', refreshWhenVisible)
    }
  }, [])

  return (
    <div className="wspr-map" aria-label="WSPR path map">
      {paths.length === 0 ? <p>No map paths to display.</p> : null}
      <div ref={containerRef} className="map-canvas" role="application" aria-label="World map" />
      <ActivityDetails feature={selected} onClose={() => setSelectedId(null)} />
    </div>
  )
}
