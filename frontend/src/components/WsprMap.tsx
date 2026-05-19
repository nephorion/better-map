// SPDX-License-Identifier: AGPL-3.0-only
import 'maplibre-gl/dist/maplibre-gl.css'
import { MapboxOverlay } from '@deck.gl/mapbox'
import { PathLayer, PolygonLayer, ScatterplotLayer } from '@deck.gl/layers'
import maplibregl, {
  type Map as MapLibreMap,
  type StyleSpecification,
} from 'maplibre-gl'
import { useEffect, useMemo, useRef, useState } from 'react'
import type { ActivityFeature } from '../services/wsprActivity'
import { interpolateArc, toMapPaths } from '../services/mapFeatures'
import { defaultUserConfig, requestWindowToHours, type RequestWindow, type UserConfig } from '../services/userConfig'
import { filterWsprFeaturesByBand } from '../services/wsprFilters'
import { ActivityDetails } from './ActivityDetails'
import { ConfigPanel } from './ConfigPanel'
import { defaultBaseMapLayer, findBaseMapLayer, type BaseMapLayer } from '../services/baseMapLayers'
import { readStoredMapView, saveMapView } from '../services/mapView'
import * as terminatorService from '../services/terminator'

type ActivityRole = ActivityFeature['properties']['role']

type PathEndpoint = {
  id: string
  pathId: string
  coordinates: [number, number]
  endpoint: 'start' | 'end'
  station: string
  stationRole: 'tx' | 'rx'
  activityRole: ActivityRole
  opacity: number
}

type PathSegment = {
  id: string
  pathId: string
  arc: [number, number][]
  activityRole: ActivityRole
  opacity: number
}

type PulseDot = {
  id: string
  position: [number, number]
  activityRole: ActivityRole
  opacity: number
}

type RgbaColor = [number, number, number, number]

type WsprMapProps = {
  features: ActivityFeature[]
  truncated?: boolean
  baseLayerId?: BaseMapLayer['id']
  activeCallsign?: string | null
  userConfig?: UserConfig
  configOpen?: boolean
  firstRunConfig?: boolean
  onOpenConfig?: () => void
  onCloseConfig?: () => void
  onSaveConfig?: (config: UserConfig) => void
}

const TX_COLOR: RgbaColor = [255, 154, 162, 230]
const RX_COLOR: RgbaColor = [170, 225, 170, 230]
const BOTH_COLOR: RgbaColor = [255, 222, 122, 230]
const MIN_AGE_OPACITY = 0.08

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

function startsAtReceiver(path: ReturnType<typeof toMapPaths>[number], activeCallsign?: string | null) {
  const active = activeCallsign?.trim().toUpperCase()
  const tx = path.properties.tx_sign?.trim().toUpperCase()
  const rx = path.properties.rx_sign?.trim().toUpperCase()
  return active === rx && active !== tx
}

function parseWsprUtcTime(time: string) {
  const normalized = /(?:Z|[+-]\d{2}:?\d{2})$/i.test(time) ? time : `${time}Z`
  return Date.parse(normalized)
}

function opacityForAge(time: string, requestWindow: RequestWindow) {
  const observedAt = parseWsprUtcTime(time)
  if (!Number.isFinite(observedAt)) return 1
  const windowMs = requestWindowToHours(requestWindow) * 60 * 60 * 1000
  const ageRatio = Math.max(0, Date.now() - observedAt) / windowMs
  return Math.max(MIN_AGE_OPACITY, Math.min(1, 1 - ageRatio))
}

function pathSegments(paths: ReturnType<typeof toMapPaths>, requestWindow: RequestWindow): PathSegment[] {
  return paths.map((path) => {
    const opacity = opacityForAge(path.properties.time, requestWindow)
    return { id: path.id, pathId: path.id, arc: path.arc, activityRole: path.properties.role, opacity }
  })
}

function pulseDots(segments: PathSegment[], t: number, paths: ReturnType<typeof toMapPaths>): PulseDot[] {
  return segments.map((segment, i) => {
    // Spots flow outward from the active callsign; heard flows inward.
    const directed = segment.activityRole === 'receiver' ? 1 - t : t
    return {
      id: `pulse-${segment.id}`,
      position: interpolateArc(paths[i].arc, directed),
      activityRole: segment.activityRole,
      opacity: segment.opacity,
    }
  })
}

function pathEndpoints(paths: ReturnType<typeof toMapPaths>, requestWindow: RequestWindow, activeCallsign?: string | null): PathEndpoint[] {
  return paths.flatMap((path) => {
    const tx = path.properties.tx_sign
    const rx = path.properties.rx_sign
    const receiverFirst = startsAtReceiver(path, activeCallsign)
    const startStation = receiverFirst ? rx : tx
    const endStation = receiverFirst ? tx : rx
    const startRole = receiverFirst ? 'rx' : 'tx'
    const endRole = receiverFirst ? 'tx' : 'rx'
    const opacity = opacityForAge(path.properties.time, requestWindow)

    return [
      { id: `${path.id}-start`, pathId: path.id, coordinates: path.coordinates[0], endpoint: 'start' as const, station: startStation, stationRole: startRole, activityRole: path.properties.role, opacity },
      { id: `${path.id}-end`, pathId: path.id, coordinates: path.coordinates[1], endpoint: 'end' as const, station: endStation, stationRole: endRole, activityRole: path.properties.role, opacity },
    ]
  })
}

function colorForActivityRole(activityRole: ActivityRole, opacity = 1): RgbaColor {
  const [r, g, b, alpha] = activityRole === 'transmitter' ? TX_COLOR : activityRole === 'receiver' ? RX_COLOR : BOTH_COLOR
  return [r, g, b, Math.round(alpha * opacity)]
}

function filterFeaturesByActivityVisibility(features: ActivityFeature[], visibility: UserConfig['activityVisibility']) {
  return features.filter((feature) => {
    if (feature.properties.role === 'transmitter') return visibility.showSpots
    if (feature.properties.role === 'receiver') return visibility.showHeard
    return visibility.showSpots || visibility.showHeard
  })
}

export function WsprMap({
  features,
  baseLayerId = 'osm-standard',
  activeCallsign = null,
  userConfig,
  configOpen,
  firstRunConfig = false,
  onOpenConfig,
  onCloseConfig,
  onSaveConfig,
}: WsprMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<MapLibreMap | null>(null)
  const deckOverlayRef = useRef<MapboxOverlay | null>(null)
  const hoveredEndpointRef = useRef<PathEndpoint | null>(null)
  const [localConfig, setLocalConfig] = useState(() => defaultUserConfig(activeCallsign ?? ''))
  const [localConfigOpen, setLocalConfigOpen] = useState(false)
  const [mapReady, setMapReady] = useState(false)
  const [selectedPathId, setSelectedPathId] = useState<string | null>(null)
  const [grayline, setGrayline] = useState(() => {
    try {
      return terminatorService.createGraylineTerminator(new Date())
    } catch {
      return null
    }
  })
  const lastGraylineRefreshRef = useRef(grayline ? Date.parse(grayline.lastUpdatedAt) : 0)
  const effectiveConfig = userConfig ?? localConfig
  const effectiveConfigOpen = configOpen ?? localConfigOpen
  const bandFilteredFeatures = useMemo(
    () => filterWsprFeaturesByBand(features, effectiveConfig.bandSelection),
    [effectiveConfig.bandSelection, features],
  )
  const filteredFeatures = useMemo(
    () => filterFeaturesByActivityVisibility(bandFilteredFeatures, effectiveConfig.activityVisibility),
    [bandFilteredFeatures, effectiveConfig.activityVisibility],
  )
  const paths = useMemo(() => toMapPaths(filteredFeatures, activeCallsign), [activeCallsign, filteredFeatures])
  const segments = useMemo(() => pathSegments(paths, effectiveConfig.requestWindow), [effectiveConfig.requestWindow, paths])
  const endpoints = useMemo(() => pathEndpoints(paths, effectiveConfig.requestWindow, activeCallsign), [activeCallsign, effectiveConfig.requestWindow, paths])
  const selectedFeature = filteredFeatures.find((feature) => feature.id === selectedPathId) ?? null
  const baseLayer = findBaseMapLayer(baseLayerId)
  const bandFilterActive = effectiveConfig.bandSelection.kind === 'specific'
  const activityFilterActive = !effectiveConfig.activityVisibility.showSpots || !effectiveConfig.activityVisibility.showHeard

  function openConfig() {
    if (onOpenConfig) onOpenConfig()
    else setLocalConfigOpen(true)
  }

  function closeConfig() {
    if (onCloseConfig) onCloseConfig()
    else setLocalConfigOpen(false)
  }

  function saveConfig(config: UserConfig) {
    setLocalConfig(config)
    if (onSaveConfig) onSaveConfig(config)
    else setLocalConfigOpen(false)
  }

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

    const overlay = deckOverlay
    const PULSE_DURATION_MS = 3000
    let animationId = 0

    const HOVER_PULSE_SPEED = 6

    function renderLayers() {
      const now = Date.now()
      const t = (now % PULSE_DURATION_MS) / PULSE_DURATION_MS
      const dots = pulseDots(segments, t, paths)
      const hovered = hoveredEndpointRef.current
      const hoverPulse = (now / 1000) * HOVER_PULSE_SPEED

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

      overlay.setProps({
        layers: [
          ...graylineLayers,
          new PathLayer<PathSegment>({
            id: 'wspr-deck-paths',
            data: segments,
            getPath: (segment) => segment.arc,
            getColor: (segment) => colorForActivityRole(segment.activityRole, segment.opacity),
            getWidth: 1.5,
            widthMinPixels: 1,
            pickable: false,
          }),
          ...(dots.length > 0
            ? [
              new ScatterplotLayer<PulseDot>({
                id: 'wspr-deck-pulse',
                data: dots,
                getPosition: (dot) => dot.position,
                getFillColor: (dot) => colorForActivityRole(dot.activityRole, Math.min(1, dot.opacity + 0.3)),
                getRadius: 3,
                radiusUnits: 'pixels',
                stroked: false,
                filled: true,
                pickable: false,
              }),
            ]
            : []),
          new ScatterplotLayer<PathEndpoint>({
            id: 'wspr-deck-endpoints',
            data: endpoints,
            getPosition: (endpoint) => endpoint.coordinates,
            getFillColor: [255, 255, 255, 0],
            getLineColor: (endpoint) => colorForActivityRole(endpoint.activityRole, endpoint.opacity),
            getRadius: 2,
            radiusUnits: 'pixels',
            stroked: true,
            filled: false,
            lineWidthMinPixels: 1,
            pickable: false,
          }),
          ...(hovered
            ? [
              new ScatterplotLayer<PathEndpoint>({
                id: 'wspr-deck-endpoint-hover',
                data: [hovered],
                getPosition: (endpoint) => endpoint.coordinates,
                getFillColor: (endpoint) => colorForActivityRole(endpoint.activityRole, 0.25),
                getLineColor: (endpoint) => colorForActivityRole(endpoint.activityRole, 1),
                getRadius: 4 + 4 * Math.sin(hoverPulse),
                radiusUnits: 'pixels',
                stroked: true,
                filled: true,
                lineWidthMinPixels: 1,
                pickable: false,
              }),
            ]
            : []),
          new ScatterplotLayer<PathEndpoint>({
            id: 'wspr-deck-endpoint-hitarea',
            data: endpoints,
            getPosition: (endpoint) => endpoint.coordinates,
            getFillColor: [0, 0, 0, 0],
            getLineColor: [0, 0, 0, 0],
            getRadius: 12,
            radiusUnits: 'pixels',
            stroked: false,
            filled: true,
            pickable: true,
            onClick: (info) => {
              if (info.object) setSelectedPathId(info.object.pathId)
            },
            onHover: (info) => {
              hoveredEndpointRef.current = (info.object as PathEndpoint) ?? null
              const cursor = info.object ? 'default' : ''
              const canvas = mapRef.current?.getCanvas()
              if (canvas) canvas.style.cursor = cursor
              if (containerRef.current) containerRef.current.style.cursor = cursor
            },
          }),
        ],
      })

      animationId = requestAnimationFrame(renderLayers)
    }

    renderLayers()
    return () => cancelAnimationFrame(animationId)
  }, [endpoints, grayline, mapReady, paths, segments])

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
      {paths.length === 0 ? (
        <p>{features.length > 0 && (bandFilterActive || activityFilterActive) ? 'No WSPR paths match the active filters.' : 'No map paths to display.'}</p>
      ) : null}
      <div ref={containerRef} className="map-canvas" role="application" aria-label="World map" />
      <button type="button" className="config-toggle" aria-label="Open map configuration" onClick={openConfig}>
        ⚙
        <span className="control-tooltip">Configuration</span>
      </button>
      {effectiveConfigOpen ? (
        <ConfigPanel value={effectiveConfig} firstRun={firstRunConfig} onSave={saveConfig} onClose={closeConfig} />
      ) : null}
      <ActivityDetails feature={selectedFeature} timeZone={effectiveConfig.timeZone} onClose={() => setSelectedPathId(null)} />
    </div>
  )
}
