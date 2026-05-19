// SPDX-License-Identifier: AGPL-3.0-only
import type { ActivityFeature } from '../services/wsprActivity'

type ActivityDetailsProps = {
  feature: ActivityFeature | null
  timeZone?: string
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

function parseWsprUtcTime(time: string) {
  const normalized = /(?:Z|[+-]\d{2}:?\d{2})$/i.test(time) ? time : `${time}Z`
  const date = new Date(normalized)
  return Number.isNaN(date.getTime()) ? null : date
}

function formatTime(date: Date | null, timeZone: string) {
  if (!date) return 'Unknown'
  return new Intl.DateTimeFormat('en-AU', {
    dateStyle: 'medium',
    timeStyle: 'long',
    timeZone,
  }).format(date)
}

export function ActivityDetails({ feature, timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC', onClose }: ActivityDetailsProps) {
  if (!feature) {
    return null
  }

  const observedAt = parseWsprUtcTime(feature.properties.time)
  const entries = Object.entries(feature.properties).filter(([key]) => key !== 'time')

  return (
    <article className="activity-details" tabIndex={0} aria-label="Selected WSPR activity details">
      <div className="details-header">
        <h2>
          {feature.properties.tx_sign} to {feature.properties.rx_sign}
        </h2>
        {onClose ? <button type="button" onClick={onClose}>Close</button> : null}
      </div>
      <dl>
        <div className="detail-row">
          <dt>UTC time</dt>
          <dd>{formatTime(observedAt, 'UTC')}</dd>
        </div>
        <div className="detail-row">
          <dt>Local time</dt>
          <dd>{formatTime(observedAt, timeZone)}</dd>
        </div>
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
