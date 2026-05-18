import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { REFRESH_INTERVAL_SECONDS, formatRemainingTime } from '../services/refreshState'

type RefreshCountdownProps = {
  remainingSeconds: number
  refreshing: boolean
  onRefresh: () => void
}

export function RefreshCountdown({ remainingSeconds, refreshing, onRefresh }: RefreshCountdownProps) {
  const [pendingManualRefresh, setPendingManualRefresh] = useState(false)
  const onRefreshRef = useRef(onRefresh)
  const refreshingRef = useRef(refreshing)
  const progress = refreshing || pendingManualRefresh ? 1 : Math.min(remainingSeconds, REFRESH_INTERVAL_SECONDS) / REFRESH_INTERVAL_SECONDS
  const tooltip = refreshing
    ? 'Refreshing WSPR activity'
    : pendingManualRefresh
      ? 'Refreshing in 3 seconds'
      : `Refresh in ${formatRemainingTime(remainingSeconds)}`

  useEffect(() => {
    onRefreshRef.current = onRefresh
  }, [onRefresh])

  useEffect(() => {
    refreshingRef.current = refreshing
  }, [refreshing])

  useEffect(() => {
    if (!pendingManualRefresh) return
    const timer = window.setTimeout(() => {
      setPendingManualRefresh(false)
      if (refreshingRef.current) return
      onRefreshRef.current()
    }, 3000)

    return () => window.clearTimeout(timer)
  }, [pendingManualRefresh])

  function queueManualRefresh() {
    if (refreshing || pendingManualRefresh) return
    setPendingManualRefresh(true)
  }

  return (
    <button
      type="button"
      className={(remainingSeconds <= 30 && !refreshing) || pendingManualRefresh ? 'refresh-countdown near-refresh' : 'refresh-countdown'}
      onClick={queueManualRefresh}
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
