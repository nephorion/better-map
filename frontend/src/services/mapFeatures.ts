import type { ActivityFeature } from './wsprActivity'

export type MapPath = {
  id: string
  coordinates: [[number, number], [number, number]]
  label: string
  snr: number | null
}

export function toMapPaths(features: ActivityFeature[]): MapPath[] {
  return features.map((feature) => ({
    id: feature.id,
    coordinates: feature.geometry.coordinates,
    label: `${feature.properties.tx_sign} -> ${feature.properties.rx_sign}`,
    snr: feature.properties.snr_db,
  }))
}
