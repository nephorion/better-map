// SPDX-License-Identifier: AGPL-3.0-only
export const GRAYLINE_REFRESH_INTERVAL_MS = 5 * 60 * 1000
export const STALE_VISIBILITY_REFRESH_MS = GRAYLINE_REFRESH_INTERVAL_MS
export const VISIBILITY_RETURN_REFRESH_MAX_MS = 1000

export type Coordinate = [number, number]

export type GraylineTerminator = {
  id: 'current-grayline-terminator'
  observationTime: string
  subsolarPoint: Coordinate
  declination: number
  renderedBoundaryPaths: Coordinate[][]
  darknessRegion: Coordinate[][]
  lastUpdatedAt: string
}

const TERMINATOR_SAMPLE_LONGITUDE_STEP = 2
const WORLD_COPY_LONGITUDE_OFFSETS = [-1080, -720, -360, 0, 360, 720, 1080]
const MIN_TAN_DECLINATION = 1e-6
const J2000_UNIX_DAYS = 10957.5

function toRadians(degrees: number) {
  return (degrees * Math.PI) / 180
}

function toDegrees(radians: number) {
  return (radians * 180) / Math.PI
}

function normalizeDegrees(degrees: number) {
  return ((degrees % 360) + 360) % 360
}

function normalizeLongitude(longitude: number) {
  const normalized = ((longitude + 180) % 360 + 360) % 360 - 180
  return Object.is(normalized, -0) ? 0 : normalized
}

function solarPosition(observationTime: Date): { subsolarLongitude: number, declination: number } {
  const daysSinceJ2000 = observationTime.getTime() / 86_400_000 - J2000_UNIX_DAYS
  const meanLongitude = normalizeDegrees(280.46 + 0.9856474 * daysSinceJ2000)
  const meanAnomaly = normalizeDegrees(357.528 + 0.9856003 * daysSinceJ2000)
  const meanAnomalyRad = toRadians(meanAnomaly)
  const eclipticLongitude = normalizeDegrees(
    meanLongitude + 1.915 * Math.sin(meanAnomalyRad) + 0.02 * Math.sin(2 * meanAnomalyRad),
  )
  const obliquity = 23.439 - 0.0000004 * daysSinceJ2000
  const eclipticLongitudeRad = toRadians(eclipticLongitude)
  const obliquityRad = toRadians(obliquity)
  const declination = toDegrees(Math.asin(Math.sin(obliquityRad) * Math.sin(eclipticLongitudeRad)))
  const rightAscension = toDegrees(
    Math.atan2(Math.cos(obliquityRad) * Math.sin(eclipticLongitudeRad), Math.cos(eclipticLongitudeRad)),
  )
  const siderealTime = normalizeDegrees(280.46061837 + 360.98564736629 * daysSinceJ2000)

  return { subsolarLongitude: normalizeLongitude(rightAscension - siderealTime), declination }
}

function terminatorLatitude(longitude: number, subsolarLongitude: number, declination: number) {
  const hourAngleRad = toRadians(normalizeLongitude(longitude - subsolarLongitude))
  const tanDeclination = Math.tan(toRadians(declination))
  const safeTanDeclination = Math.abs(tanDeclination) < MIN_TAN_DECLINATION
    ? Math.sign(tanDeclination || 1) * MIN_TAN_DECLINATION
    : tanDeclination

  return toDegrees(Math.atan(-Math.cos(hourAngleRad) / safeTanDeclination))
}

function sampleTerminator(subsolarLongitude: number, declination: number): Coordinate[] {
  const samples: Coordinate[] = []

  for (let longitude = -180; longitude <= 180; longitude += TERMINATOR_SAMPLE_LONGITUDE_STEP) {
    samples.push([longitude, terminatorLatitude(longitude, subsolarLongitude, declination)])
  }

  return samples
}

function createNightPolygon(samples: Coordinate[], declination: number): Coordinate[] {
  const darkPoleLatitude = declination >= 0 ? -90 : 90
  const westLongitude = samples[0][0]
  const eastLongitude = samples.at(-1)![0]

  return [
    [westLongitude, darkPoleLatitude],
    ...samples,
    [eastLongitude, darkPoleLatitude],
    [westLongitude, darkPoleLatitude],
  ]
}

function shiftCoordinates(coordinates: Coordinate[], longitudeOffset: number): Coordinate[] {
  return coordinates.map(([longitude, latitude]) => [longitude + longitudeOffset, latitude])
}

function repeatWorldCopies(geometry: Coordinate[]): Coordinate[][] {
  return WORLD_COPY_LONGITUDE_OFFSETS.map((offset) => shiftCoordinates(geometry, offset))
}

export function createGraylineTerminator(observationTime = new Date()): GraylineTerminator {
  const { subsolarLongitude, declination } = solarPosition(observationTime)
  const samples = sampleTerminator(subsolarLongitude, declination)
  const nightPolygon = createNightPolygon(samples, declination)
  const timestamp = observationTime.toISOString()

  return {
    id: 'current-grayline-terminator',
    observationTime: timestamp,
    subsolarPoint: [subsolarLongitude, declination],
    declination,
    renderedBoundaryPaths: repeatWorldCopies(samples),
    darknessRegion: repeatWorldCopies(nightPolygon),
    lastUpdatedAt: timestamp,
  }
}
