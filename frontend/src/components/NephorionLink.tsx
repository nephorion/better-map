import { NEPHORION_URL, SUPPORT_LINK_LABELS } from '../services/supportLinks'

export function NephorionLink() {
  return (
    <p className="nephorion-credit">
      built by{' '}
      <a href={NEPHORION_URL} target="_blank" rel="noreferrer" aria-label={SUPPORT_LINK_LABELS.nephorion}>
        nephorion
      </a>
    </p>
  )
}
