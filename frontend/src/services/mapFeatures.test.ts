// SPDX-License-Identifier: AGPL-3.0-only
import { interpolateArc, toMapPaths } from './mapFeatures'
import type { ActivityFeature } from './wsprActivity'

test('converts activity features into map paths', () => {
  const feature: ActivityFeature = {
    id: '1',
    type: 'Feature',
    geometry: { type: 'LineString', coordinates: [[151.2, -33.8], [144.9, -37.8]] },
    properties: {
      time: '2026-05-16T10:30:00Z',
      tx_sign: 'VK2DJJ',
      rx_sign: 'VK3ABC',
      distance_km: 713,
      frequency_hz: 14095600,
      band: '20m',
      snr_db: -18,
      power_dbm: 30,
      role: 'transmitter',
    },
  }

  const paths = toMapPaths([feature])
  expect(paths).toMatchObject([
    {
      id: '1',
      coordinates: [[151.2, -33.8], [144.9, -37.8]],
      label: 'VK2DJJ -> VK3ABC',
      snr: -18,
      properties: feature.properties,
    },
  ])
  expect(paths[0].arc.length).toBeGreaterThan(2)
  expect(paths[0].arc[0]).toEqual([151.2, -33.8])
  expect(paths[0].arc[paths[0].arc.length - 1]).toEqual([144.9, -37.8])
})

test('starts paths at the selected callsign when it is the receiver', () => {
  const feature: ActivityFeature = {
    id: '1',
    type: 'Feature',
    geometry: { type: 'LineString', coordinates: [[-74, 40], [151, -34]] },
    properties: {
      time: '2026-05-16T10:30:00Z',
      tx_sign: 'K1ABC',
      rx_sign: 'VK2DJJ',
      distance_km: 16000,
      frequency_hz: 14095600,
      band: '20m',
      snr_db: -18,
      power_dbm: 30,
      role: 'receiver',
    },
  }

  expect(toMapPaths([feature], 'vk2djj')[0].coordinates).toEqual([[151, -34], [286, 40]])
})

test('shortens westbound antimeridian paths from the active receiver', () => {
  const feature: ActivityFeature = {
    id: '1',
    type: 'Feature',
    geometry: { type: 'LineString', coordinates: [[170, 10], [-170, -10]] },
    properties: {
      time: '2026-05-16T10:30:00Z',
      tx_sign: 'ZL1ABC',
      rx_sign: 'KH6ABC',
      distance_km: 2200,
      frequency_hz: 14095600,
      band: '20m',
      snr_db: -18,
      power_dbm: 30,
      role: 'receiver',
    },
  }

  expect(toMapPaths([feature], 'KH6ABC')[0].coordinates).toEqual([[-170, -10], [-190, 10]])
})

test('draws the shortest eastward path from Australia to the Americas', () => {
  const feature: ActivityFeature = {
    id: '1',
    type: 'Feature',
    geometry: { type: 'LineString', coordinates: [[151, -34], [-122, 37]] },
    properties: {
      time: '2026-05-16T10:30:00Z',
      tx_sign: 'VK2DJJ',
      rx_sign: 'W6ABC',
      distance_km: 12000,
      frequency_hz: 14095600,
      band: '20m',
      snr_db: -18,
      power_dbm: 30,
      role: 'transmitter',
    },
  }

  expect(toMapPaths([feature], 'VK2DJJ')[0].coordinates).toEqual([[151, -34], [238, 37]])
})

test('draws the shortest westward path from Australia to Europe', () => {
  const feature: ActivityFeature = {
    id: '1',
    type: 'Feature',
    geometry: { type: 'LineString', coordinates: [[151, -34], [10, 50]] },
    properties: {
      time: '2026-05-16T10:30:00Z',
      tx_sign: 'VK2DJJ',
      rx_sign: 'DL1ABC',
      distance_km: 16000,
      frequency_hz: 14095600,
      band: '20m',
      snr_db: -18,
      power_dbm: 30,
      role: 'transmitter',
    },
  }

  expect(toMapPaths([feature], 'VK2DJJ')[0].coordinates).toEqual([[151, -34], [10, 50]])
})

test('keeps arc longitudes continuous across the antimeridian', () => {
  const feature: ActivityFeature = {
    id: '1',
    type: 'Feature',
    geometry: { type: 'LineString', coordinates: [[151, -34], [-122, 37]] },
    properties: {
      time: '2026-05-16T10:30:00Z',
      tx_sign: 'VK2DJJ',
      rx_sign: 'W6ABC',
      distance_km: 12000,
      frequency_hz: 14095600,
      band: '20m',
      snr_db: -18,
      power_dbm: 30,
      role: 'transmitter',
    },
  }

  const paths = toMapPaths([feature], 'VK2DJJ')
  const arc = paths[0].arc
  // No consecutive points should jump more than ~10 degrees apart.
  for (let i = 1; i < arc.length; i++) {
    expect(Math.abs(arc[i][0] - arc[i - 1][0])).toBeLessThan(10)
  }
  // The arc should go eastward past 180 rather than wrapping west.
  expect(arc[0][0]).toBe(151)
  expect(arc[arc.length - 1][0]).toBe(238)
})

test('returns a two-point arc for same-location paths', () => {
  const feature: ActivityFeature = {
    id: '1',
    type: 'Feature',
    geometry: { type: 'LineString', coordinates: [[151.2, -33.8], [151.2, -33.8]] },
    properties: {
      time: '2026-05-16T10:30:00Z',
      tx_sign: 'VK2DJJ',
      rx_sign: 'VK2DJJ',
      distance_km: 0,
      frequency_hz: 14095600,
      band: '20m',
      snr_db: -18,
      power_dbm: 30,
      role: 'both',
    },
  }

  const paths = toMapPaths([feature])
  expect(paths[0].arc).toEqual([[151.2, -33.8], [151.2, -33.8]])
})

test('interpolates positions along an arc at fractional offsets', () => {
  const arc: [number, number][] = [[0, 0], [10, 10], [20, 20]]

  expect(interpolateArc(arc, 0)).toEqual([0, 0])
  expect(interpolateArc(arc, 1)).toEqual([20, 20])
  expect(interpolateArc(arc, 0.5)).toEqual([10, 10])
  expect(interpolateArc(arc, 0.25)[0]).toBeCloseTo(5)
  expect(interpolateArc(arc, -1)).toEqual([0, 0])
  expect(interpolateArc(arc, 2)).toEqual([20, 20])
})
