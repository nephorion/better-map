import { render, screen } from '@testing-library/react'
import { ActivityDetails } from './ActivityDetails'
import type { ActivityFeature } from '../services/wsprActivity'

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

test('does not render a panel when no activity is selected', () => {
  const { container } = render(<ActivityDetails feature={null} />)

  expect(container).toBeEmptyDOMElement()
})

test('shows selected activity details in a keyboard reachable region', () => {
  render(<ActivityDetails feature={feature} />)

  expect(screen.getByLabelText(/selected wspr activity details/i)).toHaveAttribute('tabIndex', '0')
  expect(screen.getByText(/VK2DJJ to VK3ABC/i)).toBeInTheDocument()
  expect(screen.getByText(/713/)).toBeInTheDocument()
})

test('shows unknown fallbacks for missing optional details', () => {
  render(
    <ActivityDetails
      feature={{
        ...feature,
        properties: {
          ...feature.properties,
          distance_km: null,
          snr_db: null,
          band: null,
        },
      }}
    />,
  )

  expect(screen.getByText(/unknown km/i)).toBeInTheDocument()
  expect(screen.getByText(/unknown db/i)).toBeInTheDocument()
  expect(screen.getByText(/^unknown$/i)).toBeInTheDocument()
})
