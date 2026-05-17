const CALLSIGN_PATTERN = /^[A-Z0-9/]{3,12}$/
const STORAGE_KEY = 'better-map.activeCallsign'

export function normalizeCallsign(value: string) {
  return value.trim().toUpperCase()
}

export function isValidCallsign(value: string) {
  return CALLSIGN_PATTERN.test(normalizeCallsign(value))
}

export type StoredCallsignResult =
  | { callsign: string; warning: null }
  | { callsign: null; warning: string | null }

export function readStoredCallsign(storage: Storage = window.localStorage): StoredCallsignResult {
  try {
    const value = storage.getItem(STORAGE_KEY)
    if (!value) return { callsign: null, warning: null }
    const callsign = normalizeCallsign(value)
    return isValidCallsign(callsign)
      ? { callsign, warning: null }
      : { callsign: null, warning: 'Saved callsign was invalid. Choose a callsign to continue.' }
  } catch {
    return { callsign: null, warning: 'Callsign storage is unavailable. This session can continue without persistence.' }
  }
}

export function saveCallsign(callsign: string, storage: Storage = window.localStorage) {
  const normalized = normalizeCallsign(callsign)
  if (!isValidCallsign(normalized)) return { callsign: null, warning: 'Enter a valid callsign.' }

  try {
    storage.setItem(STORAGE_KEY, normalized)
    return { callsign: normalized, warning: null }
  } catch {
    return {
      callsign: normalized,
      warning: 'Callsign saved for this session only because browser storage is unavailable.',
    }
  }
}

export function callsignStorageKey() {
  return STORAGE_KEY
}
