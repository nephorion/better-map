// SPDX-License-Identifier: AGPL-3.0-only
import {
  createGraylineTerminator,
  GRAYLINE_REFRESH_INTERVAL_MS,
  STALE_VISIBILITY_REFRESH_MS,
  VISIBILITY_RETURN_REFRESH_MAX_MS,
} from './terminator'

test('creates current grayline geometry with valid coordinate ranges', () => {
  const terminator = createGraylineTerminator(new Date('2026-05-18T12:00:00Z'))
  const centralPath = terminator.renderedBoundaryPaths[Math.floor(terminator.renderedBoundaryPaths.length / 2)]

  expect(terminator.id).toBe('current-grayline-terminator')
  expect(terminator.observationTime).toBe('2026-05-18T12:00:00.000Z')
  expect(terminator.lastUpdatedAt).toBe(terminator.observationTime)
  expect(centralPath.length).toBeGreaterThan(90)
  expect(centralPath[0][0]).toBe(-180)
  expect(centralPath.at(-1)![0]).toBe(180)
  for (const [longitude, latitude] of centralPath) {
    expect(Number.isFinite(longitude)).toBe(true)
    expect(latitude).toBeGreaterThanOrEqual(-90)
    expect(latitude).toBeLessThanOrEqual(90)
  }
})

test('encloses the dark pole in the night polygon', () => {
  const summerTerminator = createGraylineTerminator(new Date('2026-06-21T00:00:00Z'))
  const winterTerminator = createGraylineTerminator(new Date('2026-12-21T00:00:00Z'))
  const summerPolygon = summerTerminator.darknessRegion[Math.floor(summerTerminator.darknessRegion.length / 2)]
  const winterPolygon = winterTerminator.darknessRegion[Math.floor(winterTerminator.darknessRegion.length / 2)]

  expect(summerTerminator.declination).toBeGreaterThan(0)
  expect(summerPolygon.some(([, latitude]) => latitude === -90)).toBe(true)
  expect(summerPolygon.every(([, latitude]) => latitude !== 90)).toBe(true)
  expect(winterTerminator.declination).toBeLessThan(0)
  expect(winterPolygon.some(([, latitude]) => latitude === 90)).toBe(true)
  expect(winterPolygon.every(([, latitude]) => latitude !== -90)).toBe(true)
})

test('keeps each rendered terminator path monotone in longitude with bounded steps', () => {
  const terminator = createGraylineTerminator(new Date('2026-05-18T12:00:00Z'))

  for (const path of terminator.renderedBoundaryPaths) {
    for (let index = 1; index < path.length; index += 1) {
      const delta = path[index][0] - path[index - 1][0]
      expect(delta).toBeGreaterThan(0)
      expect(delta).toBeLessThanOrEqual(2)
    }
  }
})

test('keeps each darkness polygon free of antimeridian discontinuities within its world copy', () => {
  const terminator = createGraylineTerminator(new Date('2026-05-18T12:00:00Z'))

  for (const polygon of terminator.darknessRegion) {
    expect(polygon.length).toBeGreaterThan(3)
    expect(polygon.at(0)).toEqual(polygon.at(-1))
    const longitudes = polygon.map(([longitude]) => longitude)
    const span = Math.max(...longitudes) - Math.min(...longitudes)
    expect(span).toBeGreaterThan(355)
    expect(span).toBeLessThan(365)
    for (const [, latitude] of polygon) {
      expect(latitude).toBeGreaterThanOrEqual(-90)
      expect(latitude).toBeLessThanOrEqual(90)
    }
  }
})

test('repeats rendered geometry for wrapped world copies at low zoom', () => {
  const terminator = createGraylineTerminator(new Date('2026-05-18T12:00:00Z'))
  const pathLongitudes = terminator.renderedBoundaryPaths.flat().map(([longitude]) => longitude)
  const polygonLongitudes = terminator.darknessRegion.flat().map(([longitude]) => longitude)

  expect(terminator.renderedBoundaryPaths.length).toBeGreaterThanOrEqual(7)
  expect(terminator.darknessRegion.length).toBeGreaterThanOrEqual(7)
  expect(Math.min(...pathLongitudes)).toBeLessThan(-1000)
  expect(Math.max(...pathLongitudes)).toBeGreaterThan(1000)
  expect(Math.min(...polygonLongitudes)).toBeLessThan(-1000)
  expect(Math.max(...polygonLongitudes)).toBeGreaterThan(1000)
})

test('produces finite geometry near equinox when declination is near zero', () => {
  const terminator = createGraylineTerminator(new Date('2026-03-20T16:15:00Z'))

  for (const path of terminator.renderedBoundaryPaths) {
    for (const [, latitude] of path) {
      expect(Number.isFinite(latitude)).toBe(true)
      expect(latitude).toBeGreaterThanOrEqual(-90)
      expect(latitude).toBeLessThanOrEqual(90)
    }
  }
})

test('uses each observation time without mutating previous output', () => {
  const first = createGraylineTerminator(new Date('2026-05-18T00:00:00Z'))
  const firstPathSnapshot = first.renderedBoundaryPaths.map((path) => path.map((coordinate) => [...coordinate]))
  const second = createGraylineTerminator(new Date('2026-05-18T00:05:00Z'))

  expect(second.observationTime).toBe('2026-05-18T00:05:00.000Z')
  expect(second.renderedBoundaryPaths[0]).not.toEqual(first.renderedBoundaryPaths[0])
  expect(first.renderedBoundaryPaths).toEqual(firstPathSnapshot)
})

test('exports documented refresh thresholds', () => {
  expect(GRAYLINE_REFRESH_INTERVAL_MS).toBe(300_000)
  expect(STALE_VISIBILITY_REFRESH_MS).toBe(GRAYLINE_REFRESH_INTERVAL_MS)
  expect(VISIBILITY_RETURN_REFRESH_MAX_MS).toBe(1000)
})
