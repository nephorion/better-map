// SPDX-License-Identifier: AGPL-3.0-only
import type { ActivityFeature } from './wsprActivity'
import type { BandId, Selection } from './userConfig'

const NUMERIC_BAND_TO_ID = new Map<string, BandId>([
  ['0.136', '2200m'],
  ['0.137', '2200m'],
  ['0.474', '630m'],
  ['0.475', '630m'],
  ['1', '160m'],
  ['1.8', '160m'],
  ['3', '80m'],
  ['3.5', '80m'],
  ['5', '60m'],
  ['7', '40m'],
  ['10', '30m'],
  ['14', '20m'],
  ['18', '17m'],
  ['21', '15m'],
  ['24', '12m'],
  ['28', '10m'],
  ['29', '10m'],
  ['50', '6m'],
  ['144', '2m'],
  ['222', '1.25m'],
  ['430', '70cm'],
  ['432', '70cm'],
  ['902', '33cm'],
  ['1240', '23cm'],
  ['1296', '23cm'],
  ['2300', '13cm'],
  ['2400', '13cm'],
  ['3400', '9cm'],
  ['5650', '5cm'],
  ['5760', '5cm'],
  ['10368', '3cm'],
])

export function normalizeWsprBand(value: string | null | undefined) {
  const normalized = value?.trim().toLowerCase().replace(/\s+/g, '') ?? ''
  const numeric = normalized.match(/^([0-9]+(?:\.[0-9]+)?)(?:mhz)?$/)?.[1]
  return numeric ? (NUMERIC_BAND_TO_ID.get(numeric) ?? normalized) : normalized
}

function bandFromFrequency(frequencyHz: number | null) {
  if (!frequencyHz) return ''
  const mhz = frequencyHz / 1_000_000
  if (mhz >= 0.135 && mhz < 0.138) return '2200m'
  if (mhz >= 0.472 && mhz < 0.48) return '630m'
  if (mhz >= 1.8 && mhz < 2) return '160m'
  if (mhz >= 3.5 && mhz < 4) return '80m'
  if (mhz >= 5 && mhz < 5.5) return '60m'
  if (mhz >= 7 && mhz < 7.3) return '40m'
  if (mhz >= 10 && mhz < 10.2) return '30m'
  if (mhz >= 14 && mhz < 14.4) return '20m'
  if (mhz >= 18 && mhz < 18.2) return '17m'
  if (mhz >= 21 && mhz < 21.5) return '15m'
  if (mhz >= 24 && mhz < 25) return '12m'
  if (mhz >= 28 && mhz < 30) return '10m'
  if (mhz >= 50 && mhz < 54) return '6m'
  if (mhz >= 144 && mhz < 148) return '2m'
  if (mhz >= 222 && mhz < 225) return '1.25m'
  if (mhz >= 420 && mhz < 450) return '70cm'
  if (mhz >= 902 && mhz < 928) return '33cm'
  if (mhz >= 1240 && mhz < 1300) return '23cm'
  if (mhz >= 2300 && mhz < 2450) return '13cm'
  if (mhz >= 3300 && mhz < 3500) return '9cm'
  if (mhz >= 5650 && mhz < 5925) return '5cm'
  if (mhz >= 10000 && mhz < 10500) return '3cm'
  if (mhz >= 10500) return 'above-10.5ghz'
  return ''
}

export function normalizeWsprFeatureBand(feature: ActivityFeature) {
  const band = normalizeWsprBand(feature.properties.band)
  return band || bandFromFrequency(feature.properties.frequency_hz)
}

export function filterWsprFeaturesByBand(features: ActivityFeature[], bandSelection: Selection<BandId>) {
  if (bandSelection.kind === 'mixed') return features
  const selected = new Set<string>(bandSelection.values.map(normalizeWsprBand))
  return features.filter((feature) => selected.has(normalizeWsprFeatureBand(feature)))
}
