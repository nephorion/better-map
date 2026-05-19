// SPDX-License-Identifier: AGPL-3.0-only
import { isValidCallsign, normalizeCallsign } from './callsign'

export const MIXED_SELECTION = 'mixed'
const STORAGE_KEY = 'better-map.userConfig'

export type SelectionKind = 'mixed' | 'specific'

export type Selection<T extends string> = {
  kind: SelectionKind
  values: T[]
}

export type UserConfig = {
  callsign: string
  locationGrid: string
  timeZone: string
  requestWindow: RequestWindow
  activityVisibility: ActivityVisibility
  bandSelection: Selection<BandId>
  modeSelection: Selection<ModeId>
}

export type ActivityVisibility = {
  showSpots: boolean
  showHeard: boolean
}

export type RequestWindowUnit = 'hours' | 'days'

export type RequestWindow = {
  amount: number
  unit: RequestWindowUnit
}

export type SaveUserConfigResult =
  | { config: UserConfig; warning: null }
  | { config: UserConfig; warning: string }

export type Option<T extends string> = {
  id: T
  label: string
}

export const BAND_OPTIONS = [
  { id: '2200m', label: '2200 m' },
  { id: '630m', label: '630 m' },
  { id: '160m', label: '160 m' },
  { id: '80m', label: '80 m' },
  { id: '60m', label: '60 m' },
  { id: '40m', label: '40 m' },
  { id: '30m', label: '30 m' },
  { id: '20m', label: '20 m' },
  { id: '17m', label: '17 m' },
  { id: '15m', label: '15 m' },
  { id: '12m', label: '12 m' },
  { id: '10m', label: '10 m' },
  { id: '6m', label: '6 m' },
  { id: '2m', label: '2 m' },
  { id: '1.25m', label: '1.25 m' },
  { id: '70cm', label: '70 cm' },
  { id: '33cm', label: '33 cm' },
  { id: '23cm', label: '23 cm' },
  { id: '13cm', label: '13 cm' },
  { id: '9cm', label: '9 cm' },
  { id: '5cm', label: '5 cm' },
  { id: '3cm', label: '3 cm' },
  { id: 'above-10.5ghz', label: 'Above 10.5 GHz' },
] as const satisfies readonly Option<string>[]

export const MODE_OPTIONS = [
  { id: 'cw', label: 'CW' },
  { id: 'am', label: 'AM' },
  { id: 'fm', label: 'FM' },
  { id: 'ssb', label: 'SSB' },
  { id: 'digital-data', label: 'Digital/Data' },
  { id: 'rtty', label: 'RTTY' },
  { id: 'packet', label: 'Packet' },
  { id: 'ft8', label: 'FT8' },
  { id: 'psk31', label: 'PSK31' },
  { id: 'wspr', label: 'WSPR' },
  { id: 'sstv-image', label: 'SSTV/Image' },
  { id: 'atv-video', label: 'ATV/Video' },
  { id: 'satellite', label: 'Satellite' },
  { id: 'eme-weak-signal', label: 'EME/Weak-signal' },
] as const satisfies readonly Option<string>[]

export type BandId = (typeof BAND_OPTIONS)[number]['id']
export type ModeId = (typeof MODE_OPTIONS)[number]['id']

const DEFAULT_REQUEST_WINDOW: RequestWindow = { amount: 10, unit: 'days' }
const DEFAULT_ACTIVITY_VISIBILITY: ActivityVisibility = { showSpots: true, showHeard: true }
const FALLBACK_TIME_ZONE = 'UTC'
const MAX_REQUEST_WINDOW_HOURS = 24 * 30

const BAND_IDS = new Set<string>(BAND_OPTIONS.map((option) => option.id))
const MODE_IDS = new Set<string>(MODE_OPTIONS.map((option) => option.id))

export function defaultUserConfig(callsign = ''): UserConfig {
  return {
    callsign: normalizeOptionalCallsign(callsign),
    locationGrid: '',
    timeZone: defaultTimeZone(),
    requestWindow: DEFAULT_REQUEST_WINDOW,
    activityVisibility: DEFAULT_ACTIVITY_VISIBILITY,
    bandSelection: { kind: 'mixed', values: [] },
    modeSelection: { kind: 'mixed', values: [] },
  }
}

export function defaultTimeZone() {
  return Intl.DateTimeFormat().resolvedOptions().timeZone || FALLBACK_TIME_ZONE
}

export function isValidTimeZone(value: string) {
  try {
    new Intl.DateTimeFormat(undefined, { timeZone: value }).format(new Date())
    return true
  } catch {
    return false
  }
}

export function normalizeTimeZone(value: unknown) {
  const timeZone = typeof value === 'string' ? value.trim() : ''
  return timeZone && isValidTimeZone(timeZone) ? timeZone : defaultTimeZone()
}

export function normalizeActivityVisibility(value: Partial<ActivityVisibility> | null | undefined): ActivityVisibility {
  return {
    showSpots: typeof value?.showSpots === 'boolean' ? value.showSpots : DEFAULT_ACTIVITY_VISIBILITY.showSpots,
    showHeard: typeof value?.showHeard === 'boolean' ? value.showHeard : DEFAULT_ACTIVITY_VISIBILITY.showHeard,
  }
}

export function normalizeRequestWindow(value: Partial<RequestWindow> | null | undefined): RequestWindow {
  const unit = value?.unit === 'hours' || value?.unit === 'days' ? value.unit : DEFAULT_REQUEST_WINDOW.unit
  const rawAmount = Number(value?.amount)
  const amount = Number.isFinite(rawAmount) ? Math.floor(rawAmount) : DEFAULT_REQUEST_WINDOW.amount
  const maxAmount = unit === 'hours' ? MAX_REQUEST_WINDOW_HOURS : Math.floor(MAX_REQUEST_WINDOW_HOURS / 24)
  return { amount: Math.min(Math.max(amount, 1), maxAmount), unit }
}

export function requestWindowToHours(value: RequestWindow) {
  const normalized = normalizeRequestWindow(value)
  return normalized.unit === 'days' ? normalized.amount * 24 : normalized.amount
}

export function normalizeOptionalCallsign(value: string) {
  const normalized = normalizeCallsign(value)
  return normalized && isValidCallsign(normalized) ? normalized : ''
}

export function validateOptionalCallsign(value: string) {
  const normalized = normalizeCallsign(value)
  return normalized === '' || isValidCallsign(normalized)
}

export function normalizeMaidenhead(value: string) {
  return value.trim().toUpperCase().replace(/\s+/g, '')
}

export function isValidMaidenhead(value: string) {
  const normalized = normalizeMaidenhead(value)
  if (normalized === '') return true
  return /^[A-R]{2}\d{2}(?:[A-X]{2})?$/.test(normalized)
}

export function normalizeSelection<T extends string>(values: readonly string[], validIds: ReadonlySet<string>): Selection<T> {
  if (values.includes(MIXED_SELECTION)) return { kind: 'mixed', values: [] }
  const seen = new Set<T>()
  for (const value of values) {
    if (validIds.has(value)) seen.add(value as T)
  }
  const selected = [...seen]
  return selected.length > 0 ? { kind: 'specific', values: selected } : { kind: 'mixed', values: [] }
}

export function normalizeBandSelection(values: readonly string[]) {
  return normalizeSelection<BandId>(values, BAND_IDS)
}

export function normalizeModeSelection(values: readonly string[]) {
  return normalizeSelection<ModeId>(values, MODE_IDS)
}

type RawStoredConfig = Partial<{
  callsign: unknown
  locationGrid: unknown
  timeZone: unknown
  requestWindow: Partial<RequestWindow>
  activityVisibility: Partial<ActivityVisibility>
  bandSelection: Partial<Selection<string>>
  modeSelection: Partial<Selection<string>>
}>

function selectionValues(selection: RawStoredConfig['bandSelection'] | RawStoredConfig['modeSelection']) {
  if (!selection || selection.kind === 'mixed') return [MIXED_SELECTION]
  return Array.isArray(selection.values) ? selection.values.filter((value): value is string => typeof value === 'string') : []
}

export function normalizeUserConfig(value: RawStoredConfig, fallbackCallsign = ''): UserConfig {
  const locationGrid = typeof value.locationGrid === 'string' ? normalizeMaidenhead(value.locationGrid) : ''
  return {
    callsign: normalizeOptionalCallsign(typeof value.callsign === 'string' ? value.callsign : fallbackCallsign),
    locationGrid: isValidMaidenhead(locationGrid) ? locationGrid : '',
    timeZone: normalizeTimeZone(value.timeZone),
    requestWindow: normalizeRequestWindow(value.requestWindow),
    activityVisibility: normalizeActivityVisibility(value.activityVisibility),
    bandSelection: normalizeBandSelection(selectionValues(value.bandSelection)),
    modeSelection: normalizeModeSelection(selectionValues(value.modeSelection)),
  }
}

export function readUserConfig(fallbackCallsign = '', storage: Storage = window.localStorage): SaveUserConfigResult {
  try {
    const stored = storage.getItem(STORAGE_KEY)
    if (!stored) return { config: defaultUserConfig(fallbackCallsign), warning: null }
    return { config: normalizeUserConfig(JSON.parse(stored) as RawStoredConfig, fallbackCallsign), warning: null }
  } catch {
    return {
      config: defaultUserConfig(fallbackCallsign),
      warning: 'Configuration storage is unavailable. This session can continue without persistence.',
    }
  }
}

export function saveUserConfig(config: UserConfig, storage: Storage = window.localStorage): SaveUserConfigResult {
  const normalized = normalizeUserConfig(config)
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(normalized))
    return { config: normalized, warning: null }
  } catch {
    return { config: normalized, warning: 'Configuration saved for this session only because browser storage is unavailable.' }
  }
}

export function userConfigStorageKey() {
  return STORAGE_KEY
}
