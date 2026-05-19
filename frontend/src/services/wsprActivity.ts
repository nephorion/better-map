// SPDX-License-Identifier: AGPL-3.0-only
import { API_BASE_URL } from './config'
import { ApiClientError, type ApiErrorCode } from './apiClient'
import { requestWindowToHours, type RequestWindow } from './userConfig'

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
  window_hours: number
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

export async function fetchWsprActivity(callsign?: string | null, requestWindow?: RequestWindow, resultLimit?: number): Promise<ActivityLookupResult> {
  const normalized = callsign?.trim() ?? ''
  const params = new URLSearchParams()
  if (normalized) params.set('callsign', normalized)
  if (requestWindow) params.set('window_hours', String(requestWindowToHours(requestWindow)))
  if (resultLimit != null) params.set('limit', String(resultLimit))
  const query = params.toString() ? `?${params}` : ''
  const response = await fetch(`${API_BASE_URL}/api/wspr/activity${query}`)

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
