import type { ActivityFeature } from '../services/wsprActivity'

type ActivityDetailsProps = {
  feature: ActivityFeature | null
  onClose?: () => void
}

function labelFor(key: string) {
  return key.replaceAll('_', ' ')
}

function displayValue(key: string, value: unknown) {
  const fallback = 'Unknown'
  if (key === 'distance_km') return `${value ?? fallback} km`
  if (key === 'snr_db') return `${value ?? fallback} dB`
  return String(value ?? fallback)
}

export function ActivityDetails({ feature, onClose }: ActivityDetailsProps) {
  if (!feature) {
    return null
  }

  const entries = Object.entries(feature.properties)

  return (
    <article className="activity-details" tabIndex={0} aria-label="Selected WSPR activity details">
      <div className="details-header">
        <h2>
          {feature.properties.tx_sign} to {feature.properties.rx_sign}
        </h2>
        {onClose ? <button type="button" onClick={onClose}>Close</button> : null}
      </div>
      <dl>
        {entries.map(([key, value]) => (
          <div key={key} className="detail-row">
            <dt>{labelFor(key)}</dt>
            <dd>{displayValue(key, value)}</dd>
          </div>
        ))}
      </dl>
    </article>
  )
}
