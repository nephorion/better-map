export const REFRESH_INTERVAL_SECONDS = 5 * 60

export function nextRefreshAt(now = Date.now(), intervalSeconds = REFRESH_INTERVAL_SECONDS) {
  return now + intervalSeconds * 1000
}

export function remainingRefreshSeconds(targetTime: number, now = Date.now()) {
  return Math.max(0, Math.ceil((targetTime - now) / 1000))
}

export function formatRemainingTime(seconds: number) {
  const minutes = Math.floor(seconds / 60)
  const remainder = seconds % 60
  return `${minutes}:${remainder.toString().padStart(2, '0')}`
}
