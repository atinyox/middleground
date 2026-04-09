import { useCallback, useRef } from 'react'
import { useAppStore } from '../store/appStore'
import { computeGeographicMidpoint } from '../utils/geo'
import { searchWithFallback } from '../utils/places'

export function useMidpointSearch() {
  const { setSearchState, mapRef } = useAppStore()
  const serviceRef = useRef<google.maps.places.PlacesService | null>(null)

  const getService = useCallback(() => {
    if (!serviceRef.current && mapRef) {
      serviceRef.current = new google.maps.places.PlacesService(mapRef)
    }
    return serviceRef.current
  }, [mapRef])

  const runSearch = useCallback(async () => {
    // Read addresses fresh from store so stale closures don't cause missed updates
    const geocoded = useAppStore.getState().addresses
      .filter((a) => a.geocoded !== null)
      .map((a) => a.geocoded!)

    if (geocoded.length < 2) {
      setSearchState({ status: 'error', error: 'Enter at least 2 addresses.' })
      return
    }

    const service = getService()
    if (!service) {
      setSearchState({ status: 'error', error: 'Map not ready. Please try again.' })
      return
    }

    setSearchState({ status: 'computing', error: undefined })

    const midpoint = computeGeographicMidpoint(geocoded)

    setSearchState({ status: 'searching', geographicMidpoint: midpoint })

    try {
      const result = await searchWithFallback(service, midpoint)
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
  }, [getService, setSearchState])

  return { runSearch }
}
