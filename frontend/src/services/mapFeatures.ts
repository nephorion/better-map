// SPDX-License-Identifier: AGPL-3.0-only
import type { ActivityFeature } from './wsprActivity'

export type MapPath = {
  id: string
  coordinates: [[number, number], [number, number]]
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

export function toMapPaths(features: ActivityFeature[], activeCallsign?: string | null): MapPath[] {
  return features.map((feature) => ({
    id: feature.id,
    coordinates: shortestLongitudePath(startsAtActiveCallsign(feature, activeCallsign)),
    label: `${feature.properties.tx_sign} -> ${feature.properties.rx_sign}`,
    snr: feature.properties.snr_db,
    properties: feature.properties,
  }))
}
