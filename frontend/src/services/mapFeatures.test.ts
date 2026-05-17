import { toMapPaths } from './mapFeatures'
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

  expect(toMapPaths([feature])).toEqual([
    {
      id: '1',
      coordinates: [[151.2, -33.8], [144.9, -37.8]],
      label: 'VK2DJJ -> VK3ABC',
      snr: -18,
      properties: feature.properties,
    },
  ])
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
