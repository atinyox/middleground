import { useCallback } from 'react'
import { useAppStore } from '../store/appStore'
import {
  generateCandidateGrid,
  midpointDiffersMeaningfully,
} from '../utils/geo'
import { getTotalDriveTimes } from '../utils/distanceMatrix'
import { searchWithFallback } from '../utils/places'
import { GRID_RADIUS_KM, GRID_STEPS } from '../constants'

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN

export function useDriveTimeMidpoint() {
  const { addresses, searchState, setSearchState } = useAppStore()

  const compute = useCallback(async () => {
    const geoMidpoint = searchState.geographicMidpoint
    if (!geoMidpoint) return

    const geocoded = addresses
      .filter((a) => a.geocoded !== null)
      .map((a) => a.geocoded!)

    if (geocoded.length < 2) return

    setSearchState({ status: 'computing' })

    try {
      const candidates = generateCandidateGrid(geoMidpoint, GRID_RADIUS_KM, GRID_STEPS)
      const scores = await getTotalDriveTimes(MAPBOX_TOKEN, geocoded, candidates)

      const bestIdx = scores.indexOf(Math.min(...scores))
      const driveTimeMidpoint = candidates[bestIdx]

      if (!midpointDiffersMeaningfully(geoMidpoint, driveTimeMidpoint)) {
        setSearchState({ status: 'done', driveTimeMidpoint: undefined, driveTimePlaces: [] })
        return
      }

      setSearchState({ status: 'searching', driveTimeMidpoint })

      const result = await searchWithFallback(MAPBOX_TOKEN, driveTimeMidpoint)

      setSearchState({
        status: 'done',
        driveTimeMidpoint,
        driveTimePlaces: result.places,
      })
    } catch (err) {
      setSearchState({
        status: 'done',
        driveTimeMidpoint: undefined,
        driveTimePlaces: [],
        error: err instanceof Error ? err.message : 'Drive-time computation failed.',
      })
    }
  }, [addresses, searchState.geographicMidpoint, setSearchState])

  return { compute }
}
