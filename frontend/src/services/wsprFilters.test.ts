// SPDX-License-Identifier: AGPL-3.0-only
import { filterWsprFeaturesByBand, normalizeWsprBand } from './wsprFilters'
import type { ActivityFeature } from './wsprActivity'

function feature(id: string, band: string | null, frequency_hz: number | null = 14095600): ActivityFeature {
  return {
    id,
    type: 'Feature',
    geometry: { type: 'LineString', coordinates: [[0, 0], [1, 1]] },
    properties: {
      time: '2026-05-16T10:30:00Z',
      tx_sign: 'VK2DJJ',
      rx_sign: 'VK3ABC',
      distance_km: 1,
      frequency_hz,
      band,
      snr_db: -18,
      power_dbm: 30,
      role: 'transmitter',
    },
  }
}

const features = [feature('20', '20m'), feature('40', '40 m'), feature('missing', null, null), feature('unknown', 'unknown')]

test('normalizes WSPR numeric provider bands to amateur band ids', () => {
  expect(normalizeWsprBand('14')).toBe('20m')
  expect(normalizeWsprBand('14 MHz')).toBe('20m')
  expect(normalizeWsprBand('7')).toBe('40m')
})

test('returns all features when band selection is Mixed', () => {
  expect(filterWsprFeaturesByBand(features, { kind: 'mixed', values: [] })).toBe(features)
})

test('filters a single band with normalized labels', () => {
  expect(filterWsprFeaturesByBand(features, { kind: 'specific', values: ['40m'] }).map((item) => item.id)).toEqual(['40'])
})

test('filters multiple bands and excludes missing or unknown values', () => {
  expect(filterWsprFeaturesByBand(features, { kind: 'specific', values: ['20m', '40m'] }).map((item) => item.id)).toEqual(['20', '40'])
})

test('filters numeric WSPR band values and falls back to frequency when band is missing', () => {
  const numericFeatures = [feature('numeric', '14'), feature('frequency', null, 7038600), feature('miss', null, null)]

  expect(filterWsprFeaturesByBand(numericFeatures, { kind: 'specific', values: ['20m', '40m'] }).map((item) => item.id)).toEqual(['numeric', 'frequency'])
})

test.each([
  [136000, '2200m'],
  [474000, '630m'],
  [1836000, '160m'],
  [3568000, '80m'],
  [5287200, '60m'],
  [7038600, '40m'],
  [10138700, '30m'],
  [14095600, '20m'],
  [18104600, '17m'],
  [21094600, '15m'],
  [24924600, '12m'],
  [28124600, '10m'],
  [50293000, '6m'],
  [144489000, '2m'],
  [222100000, '1.25m'],
  [432300000, '70cm'],
  [915000000, '33cm'],
  [1296000000, '23cm'],
  [2400000000, '13cm'],
  [3400000000, '9cm'],
  [5760000000, '5cm'],
  [10368000000, '3cm'],
  [24000000000, 'above-10.5ghz'],
] as const)('maps %s Hz to %s when the provider band is missing', (frequency, band) => {
  expect(filterWsprFeaturesByBand([feature(band, null, frequency)], { kind: 'specific', values: [band] }).map((item) => item.id)).toEqual([band])
})

test('excludes out-of-range frequencies for specific filters', () => {
  expect(filterWsprFeaturesByBand([feature('out', null, 100000)], { kind: 'specific', values: ['20m'] })).toEqual([])
})
