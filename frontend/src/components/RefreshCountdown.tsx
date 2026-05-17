import type { CSSProperties } from 'react'
import { REFRESH_INTERVAL_SECONDS, formatRemainingTime } from '../services/refreshState'

type RefreshCountdownProps = {
  remainingSeconds: number
  refreshing: boolean
  onRefresh: () => void
}

export function RefreshCountdown({ remainingSeconds, refreshing, onRefresh }: RefreshCountdownProps) {
  const progress = refreshing ? 1 : Math.min(remainingSeconds, REFRESH_INTERVAL_SECONDS) / REFRESH_INTERVAL_SECONDS
  const tooltip = refreshing ? 'Refreshing WSPR activity' : `Refresh in ${formatRemainingTime(remainingSeconds)}`

  return (
    <button
      type="button"
      className={remainingSeconds <= 30 && !refreshing ? 'refresh-countdown near-refresh' : 'refresh-countdown'}
      onClick={onRefresh}
      aria-label="Refresh WSPR activity"
      aria-describedby="refresh-countdown-tooltip"
      data-tooltip={tooltip}
    >
      <span className="refresh-progress" style={{ '--refresh-progress': progress } as CSSProperties} />
      <span id="refresh-countdown-tooltip" className="refresh-tooltip" role="tooltip">
        {tooltip}
      </span>
    </button>
  )
}
