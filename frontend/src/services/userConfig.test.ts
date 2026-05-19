// SPDX-License-Identifier: AGPL-3.0-only
import {
  BAND_OPTIONS,
  MIXED_SELECTION,
  MODE_OPTIONS,
  defaultUserConfig,
  isValidMaidenhead,
  normalizeBandSelection,
  normalizeMaidenhead,
  normalizeModeSelection,
  normalizeActivityVisibility,
  normalizeRequestWindow,
  normalizeTimeZone,
  requestWindowToHours,
  readUserConfig,
  saveUserConfig,
  userConfigStorageKey,
  validateOptionalCallsign,
} from './userConfig'

beforeEach(() => {
  window.localStorage.clear()
})

test('provides defaults with optional callsign and Mixed selections', () => {
  expect(defaultUserConfig('vk2djj')).toEqual({
    callsign: 'VK2DJJ',
    locationGrid: '',
    timeZone: expect.any(String),
    requestWindow: { amount: 10, unit: 'days' },
    activityVisibility: { showSpots: true, showHeard: true },
    bandSelection: { kind: 'mixed', values: [] },
    modeSelection: { kind: 'mixed', values: [] },
  })
  expect(validateOptionalCallsign('')).toBe(true)
  expect(validateOptionalCallsign('vk2djj')).toBe(true)
  expect(validateOptionalCallsign('?')).toBe(false)
})

test('normalizes user time zone overrides', () => {
  expect(normalizeTimeZone('UTC')).toBe('UTC')
  expect(normalizeTimeZone('Australia/Sydney')).toBe('Australia/Sydney')
  expect(normalizeTimeZone('bad/timezone')).toBe(defaultUserConfig().timeZone)
})

test('normalizes activity visibility toggles', () => {
  expect(normalizeActivityVisibility({ showSpots: false })).toEqual({ showSpots: false, showHeard: true })
  expect(normalizeActivityVisibility({ showHeard: false })).toEqual({ showSpots: true, showHeard: false })
  expect(normalizeActivityVisibility(null)).toEqual({ showSpots: true, showHeard: true })
})

test('normalizes WSPR request windows', () => {
  expect(normalizeRequestWindow({ amount: 6, unit: 'hours' })).toEqual({ amount: 6, unit: 'hours' })
  expect(normalizeRequestWindow({ amount: 2, unit: 'days' })).toEqual({ amount: 2, unit: 'days' })
  expect(normalizeRequestWindow({ amount: 999, unit: 'hours' })).toEqual({ amount: 720, unit: 'hours' })
  expect(normalizeRequestWindow({ amount: 0, unit: 'days' })).toEqual({ amount: 1, unit: 'days' })
  expect(requestWindowToHours({ amount: 2, unit: 'days' })).toBe(48)
})

test('defines required amateur band and mode options', () => {
  expect(BAND_OPTIONS.map((option) => option.label)).toEqual(expect.arrayContaining(['2200 m', '20 m', '70 cm', 'Above 10.5 GHz']))
  expect(MODE_OPTIONS.map((option) => option.label)).toEqual(expect.arrayContaining(['CW', 'FT8', 'WSPR', 'EME/Weak-signal']))
})

test('validates and normalizes optional Maidenhead grid values', () => {
  expect(normalizeMaidenhead(' qf 56 od ')).toBe('QF56OD')
  expect(isValidMaidenhead('')).toBe(true)
  expect(isValidMaidenhead('QF56')).toBe(true)
  expect(isValidMaidenhead('QF56OD')).toBe(true)
  expect(isValidMaidenhead('QF5')).toBe(false)
  expect(isValidMaidenhead('bad')).toBe(false)
})

test('normalizes Mixed precedence and unknown selections', () => {
  expect(normalizeBandSelection([MIXED_SELECTION, '20m'])).toEqual({ kind: 'mixed', values: [] })
  expect(normalizeBandSelection(['20m', '40m', 'unknown'])).toEqual({ kind: 'specific', values: ['20m', '40m'] })
  expect(normalizeModeSelection([MIXED_SELECTION, 'wspr'])).toEqual({ kind: 'mixed', values: [] })
  expect(normalizeModeSelection(['wspr', 'ft8', 'unknown'])).toEqual({ kind: 'specific', values: ['wspr', 'ft8'] })
  expect(normalizeModeSelection(['unknown'])).toEqual({ kind: 'mixed', values: [] })
})

test('persists, reads, and normalizes user configuration', () => {
  const saved = saveUserConfig({
    callsign: 'vk2djj',
    locationGrid: 'qf56od',
    timeZone: 'Australia/Sydney',
    requestWindow: { amount: 12, unit: 'hours' },
    activityVisibility: { showSpots: true, showHeard: false },
    bandSelection: { kind: 'specific', values: ['20m'] },
    modeSelection: { kind: 'specific', values: ['wspr'] },
  })

  expect(saved.warning).toBeNull()
  expect(JSON.parse(window.localStorage.getItem(userConfigStorageKey()) ?? '{}')).toMatchObject({
    callsign: 'VK2DJJ',
    locationGrid: 'QF56OD',
    timeZone: 'Australia/Sydney',
    requestWindow: { amount: 12, unit: 'hours' },
    activityVisibility: { showSpots: true, showHeard: false },
  })
  expect(readUserConfig().config).toEqual(saved.config)
})

test('falls back when stored configuration is invalid or storage is unavailable', () => {
  window.localStorage.setItem(userConfigStorageKey(), '{')
  expect(readUserConfig('VK3ABC').config.callsign).toBe('VK3ABC')
  vi.spyOn(Storage.prototype, 'setItem').mockImplementationOnce(() => {
    throw new Error('blocked')
  })
  expect(saveUserConfig(defaultUserConfig('VK2DJJ')).warning).toMatch(/storage is unavailable|session only/i)
})

test('normalizes malformed stored selection and location shapes', () => {
  window.localStorage.setItem(userConfigStorageKey(), JSON.stringify({
    callsign: 7,
    locationGrid: 'bad',
    bandSelection: { kind: 'specific', values: ['20m', 1, 'unknown'] },
    modeSelection: { kind: 'specific', values: 'wspr' },
  }))

  expect(readUserConfig('VK3ABC').config).toEqual({
    callsign: 'VK3ABC',
    locationGrid: '',
    timeZone: defaultUserConfig().timeZone,
    requestWindow: { amount: 10, unit: 'days' },
    activityVisibility: { showSpots: true, showHeard: true },
    bandSelection: { kind: 'specific', values: ['20m'] },
    modeSelection: { kind: 'mixed', values: [] },
  })
})
