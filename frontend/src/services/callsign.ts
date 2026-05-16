const CALLSIGN_PATTERN = /^[A-Z0-9/]{3,12}$/

export function normalizeCallsign(value: string) {
  return value.trim().toUpperCase()
}

export function isValidCallsign(value: string) {
  return CALLSIGN_PATTERN.test(normalizeCallsign(value))
}
