import { useCallback } from 'react'
import { useAppStore } from '../store/appStore'
import { computeGeographicMidpoint } from '../utils/geo'
import { searchWithFallback } from '../utils/places'

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN

export function useMidpointSearch() {
  const { addresses, setSearchState } = useAppStore()

  const runSearch = useCallback(async () => {
    const geocoded = addresses
      .filter((a) => a.geocoded !== null)
      .map((a) => a.geocoded!)

    if (geocoded.length < 2) {
      setSearchState({ status: 'error', error: 'Enter at least 2 addresses.' })
      return
    }

    setSearchState({ status: 'computing', error: undefined })

    const midpoint = computeGeographicMidpoint(geocoded)

    setSearchState({ status: 'searching', geographicMidpoint: midpoint })

    try {
      const result = await searchWithFallback(MAPBOX_TOKEN, midpoint)
      setSearchState({
        status: 'done',
        places: result.places,
        searchRadius: result.searchRadius,
        usedFallback: result.usedFallback,
        fallbackType: result.fallbackType,
      })
    } catch (err) {
      setSearchState({
        status: 'error',
        error: err instanceof Error ? err.message : 'Search failed.',
      })
    }
  }, [addresses, setSearchState])

  return { runSearch }
}
