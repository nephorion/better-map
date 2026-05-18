// SPDX-License-Identifier: AGPL-3.0-only
import { callsignStorageKey } from '../services/callsign'

export function seedStoredCallsign(value: string) {
  window.localStorage.setItem(callsignStorageKey(), value)
}

export function clearStoredCallsign() {
  window.localStorage.removeItem(callsignStorageKey())
}
