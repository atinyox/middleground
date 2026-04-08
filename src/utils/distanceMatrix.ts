import type { LatLng } from '../types'

const MATRIX_BASE = 'https://api.mapbox.com/directions-matrix/v1/mapbox/driving'

/**
 * Given origin addresses and candidate destination points, returns total drive
 * time (seconds) from all origins to each candidate.
 * Returns Infinity for unreachable candidates.
 *
 * Mapbox Matrix API allows max 25 total coordinates (origins + destinations),
 * so we batch candidates into groups of (25 - numOrigins).
 */
export async function getTotalDriveTimes(
  mapboxToken: string,
  origins: LatLng[],
  candidates: LatLng[]
): Promise<number[]> {
  const maxDest = 25 - origins.length
  const scores = new Array<number>(candidates.length).fill(0)

  // Chunk candidates into batches
  for (let batchStart = 0; batchStart < candidates.length; batchStart += maxDest) {
    const batch = candidates.slice(batchStart, batchStart + maxDest)

    // Coordinates: origins first, then candidates
    const coords = [...origins, ...batch]
    const coordStr = coords
      .map((p) => `${p.lng},${p.lat}`)
      .join(';')

    const sourceIndices = origins.map((_, i) => i).join(';')
    const destIndices = batch.map((_, i) => origins.length + i).join(';')

    const url =
      `${MATRIX_BASE}/${coordStr}` +
      `?sources=${sourceIndices}` +
      `&destinations=${destIndices}` +
      `&access_token=${mapboxToken}`

    const res = await fetch(url)
    if (!res.ok) {
      throw new Error(`Mapbox Matrix API error: ${res.status} ${res.statusText}`)
    }

    const data = (await res.json()) as {
      durations: (number | null)[][]
      code: string
    }

    if (data.code !== 'Ok') {
      throw new Error(`Mapbox Matrix API returned code: ${data.code}`)
    }

    // Sum each column (destination) across all rows (origins)
    for (let j = 0; j < batch.length; j++) {
      let total = 0
      for (let i = 0; i < origins.length; i++) {
        const duration = data.durations[i]?.[j]
        if (duration === null || duration === undefined) {
          total = Infinity
          break
        }
        total += duration
      }
      scores[batchStart + j] = total
    }
  }

  return scores
}
