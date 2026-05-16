import type { ActivityFeature } from '../services/wsprActivity'

type ActivityDetailsProps = {
  feature: ActivityFeature | null
}

export function ActivityDetails({ feature }: ActivityDetailsProps) {
  if (!feature) {
    return <p className="activity-details">Select a path to inspect WSPR details.</p>
  }

  return (
    <article className="activity-details" tabIndex={0} aria-label="Selected WSPR activity details">
      <h2>
        {feature.properties.tx_sign} to {feature.properties.rx_sign}
      </h2>
      <dl>
        <dt>Time</dt>
        <dd>{feature.properties.time}</dd>
        <dt>Distance</dt>
        <dd>{feature.properties.distance_km ?? 'Unknown'} km</dd>
        <dt>SNR</dt>
        <dd>{feature.properties.snr_db ?? 'Unknown'} dB</dd>
        <dt>Band</dt>
        <dd>{feature.properties.band ?? 'Unknown'}</dd>
      </dl>
    </article>
  )
}
