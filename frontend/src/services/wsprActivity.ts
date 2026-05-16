import { API_BASE_URL } from './config'
import { ApiClientError, type ApiErrorCode } from './apiClient'

export type ActivityFeature = {
  id: string
  type: 'Feature'
  geometry: {
    type: 'LineString'
    coordinates: [[number, number], [number, number]]
  }
  properties: {
    time: string
    tx_sign: string
    rx_sign: string
    distance_km: number | null
    frequency_hz: number | null
    band: string | null
    snr_db: number | null
    power_dbm: number | null
    role: 'transmitter' | 'receiver' | 'both'
  }
}

export type ActivityLookupResult = {
  callsign: string
  window_days: number
  source: string
  count: number
  truncated: boolean
  features: ActivityFeature[]
}

type ErrorPayload = {
  detail?: {
    code?: ApiErrorCode
    message?: string
  }
}

export async function fetchWsprActivity(callsign: string): Promise<ActivityLookupResult> {
  const response = await fetch(
    `${API_BASE_URL}/api/wspr/activity?callsign=${encodeURIComponent(callsign)}`,
  )

  if (!response.ok) {
    const payload = (await response.json().catch(() => ({}))) as ErrorPayload
    throw new ApiClientError(
      payload.detail?.code ?? 'unknown_error',
      response.status,
      payload.detail?.message ?? 'The WSPR lookup failed. Try again.',
    )
  }

  return (await response.json()) as ActivityLookupResult
}
