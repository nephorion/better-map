// SPDX-License-Identifier: AGPL-3.0-only
import { callsignStorageKey, readStoredCallsign, saveCallsign } from './callsign'

function throwingStorage(): Storage {
  return {
    length: 0,
    clear: vi.fn(),
    getItem: vi.fn(() => { throw new Error('blocked') }),
    key: vi.fn(),
    removeItem: vi.fn(),
    setItem: vi.fn(() => { throw new Error('blocked') }),
  }
}

test('reads valid and invalid stored callsigns', () => {
  window.localStorage.setItem(callsignStorageKey(), ' vk2djj ')
  expect(readStoredCallsign()).toEqual({ callsign: 'VK2DJJ', warning: null })

  window.localStorage.setItem(callsignStorageKey(), '?')
  expect(readStoredCallsign()).toEqual({
    callsign: null,
    warning: 'Saved callsign was invalid. Choose a callsign to continue.',
  })
})

test('handles missing and unavailable callsign storage', () => {
  window.localStorage.removeItem(callsignStorageKey())
  expect(readStoredCallsign()).toEqual({ callsign: null, warning: null })
  expect(readStoredCallsign(throwingStorage()).warning).toMatch(/storage is unavailable/i)
})

test('saves normalized callsigns and reports session-only failures', () => {
  expect(saveCallsign(' vk2djj ')).toEqual({ callsign: 'VK2DJJ', warning: null })
  expect(window.localStorage.getItem(callsignStorageKey())).toBe('VK2DJJ')
  expect(saveCallsign('?')).toEqual({ callsign: null, warning: 'Enter a valid callsign.' })
  expect(saveCallsign('VK2DJJ', throwingStorage()).warning).toMatch(/session only/i)
})
