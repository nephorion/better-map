// SPDX-License-Identifier: AGPL-3.0-only
import type { ActivityFeature } from './wsprActivity'

const ARC_SEGMENTS = 48
const DEG_TO_RAD = Math.PI / 180
const RAD_TO_DEG = 180 / Math.PI

export type MapPath = {
  id: string
  coordinates: [[number, number], [number, number]]
  arc: [number, number][]
  label: string
  snr: number | null
  properties: ActivityFeature['properties']
}

function normalizeCallsign(value: string | null | undefined) {
  return value?.trim().toUpperCase() ?? null
}

function startsAtActiveCallsign(feature: ActivityFeature, activeCallsign?: string | null) {
  const active = normalizeCallsign(activeCallsign)
  if (!active) return feature.geometry.coordinates

  const tx = normalizeCallsign(feature.properties.tx_sign)
  const rx = normalizeCallsign(feature.properties.rx_sign)
  const [txCoordinate, rxCoordinate] = feature.geometry.coordinates

  if (active === rx && active !== tx) return [rxCoordinate, txCoordinate] as [[number, number], [number, number]]
  return [txCoordinate, rxCoordinate] as [[number, number], [number, number]]
}

function shortestLongitudePath(coordinates: [[number, number], [number, number]]) {
  const [start, end] = coordinates
  const [startLng] = start
  let [endLng] = end
  const [, endLat] = end
  const delta = endLng - startLng

  if (delta > 180) endLng -= 360
  if (delta < -180) endLng += 360

  return [start, [endLng, endLat]] as [[number, number], [number, number]]
}

function greatCircleArc(start: [number, number], end: [number, number], segments: number): [number, number][] {
  const [lng1, lat1] = start
  const [lng2, lat2] = end
  // Use canonical longitudes [-180,180] for the spherical math so atan2 is consistent.
  const canonLng1 = ((lng1 % 360) + 540) % 360 - 180
  const canonLng2 = ((lng2 % 360) + 540) % 360 - 180
  const phi1 = lat1 * DEG_TO_RAD
  const phi2 = lat2 * DEG_TO_RAD
  const lambda1 = canonLng1 * DEG_TO_RAD
  const lambda2 = canonLng2 * DEG_TO_RAD
  const dPhi = phi2 - phi1
  const dLambda = lambda2 - lambda1

  const a = Math.sin(dPhi / 2) ** 2 + Math.cos(phi1) * Math.cos(phi2) * Math.sin(dLambda / 2) ** 2
  const d = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

  if (d < 1e-9) return [start, end]

  const points: [number, number][] = []
  let prevLng = lng1
  for (let i = 0; i <= segments; i++) {
    const f = i / segments
    const A = Math.sin((1 - f) * d) / Math.sin(d)
    const B = Math.sin(f * d) / Math.sin(d)
    const x = A * Math.cos(phi1) * Math.cos(lambda1) + B * Math.cos(phi2) * Math.cos(lambda2)
    const y = A * Math.cos(phi1) * Math.sin(lambda1) + B * Math.cos(phi2) * Math.sin(lambda2)
    const z = A * Math.sin(phi1) + B * Math.sin(phi2)
    const lat = Math.atan2(z, Math.sqrt(x * x + y * y)) * RAD_TO_DEG
    let lng = Math.atan2(y, x) * RAD_TO_DEG
    // Unwrap longitude so it stays continuous with the previous point,
    // preventing visual jumps when the path crosses the antimeridian.
    while (lng - prevLng > 180) lng -= 360
    while (lng - prevLng < -180) lng += 360
    points.push([lng, lat])
    prevLng = lng
  }

  // Snap first and last point exactly to inputs to avoid floating-point drift.
  points[0] = start
  points[points.length - 1] = end
  return points
}

export function interpolateArc(arc: [number, number][], t: number): [number, number] {
  const clamped = Math.max(0, Math.min(1, t))
  const index = clamped * (arc.length - 1)
  const lower = Math.floor(index)
  const upper = Math.min(lower + 1, arc.length - 1)
  const frac = index - lower
  return [
    arc[lower][0] + (arc[upper][0] - arc[lower][0]) * frac,
    arc[lower][1] + (arc[upper][1] - arc[lower][1]) * frac,
  ]
}

export function toMapPaths(features: ActivityFeature[], activeCallsign?: string | null): MapPath[] {
  return features.map((feature) => {
    const coordinates = shortestLongitudePath(startsAtActiveCallsign(feature, activeCallsign))
    return {
      id: feature.id,
      coordinates,
      arc: greatCircleArc(coordinates[0], coordinates[1], ARC_SEGMENTS),
      label: `${feature.properties.tx_sign} -> ${feature.properties.rx_sign}`,
      snr: feature.properties.snr_db,
      properties: feature.properties,
    }
  })
}
