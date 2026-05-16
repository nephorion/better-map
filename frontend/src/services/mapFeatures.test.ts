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
    { id: '1', coordinates: [[151.2, -33.8], [144.9, -37.8]], label: 'VK2DJJ -> VK3ABC', snr: -18 },
  ])
})
