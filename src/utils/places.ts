import type { LatLng, PlaceResult } from '../types'
import { RADIUS_STEPS } from '../constants'

export async function reverseGeocode(latLng: LatLng): Promise<string> {
  const geocoder = new google.maps.Geocoder()
  const { results } = await geocoder.geocode({ location: latLng })
  return results[0]?.formatted_address ?? `${latLng.lat.toFixed(5)}, ${latLng.lng.toFixed(5)}`
}

export interface FallbackResult {
  places: PlaceResult[]
  searchRadius: number
  usedFallback: boolean
  fallbackType?: 'radius' | 'shopping_mall'
}

function mapPlaceResult(
  result: google.maps.places.PlaceResult
): PlaceResult | null {
  const location = result.geometry?.location
  if (!location || !result.place_id || !result.name) return null

  return {
    placeId: result.place_id,
    name: result.name,
    address: result.vicinity ?? '',
    location: { lat: location.lat(), lng: location.lng() },
    rating: result.rating,
    userRatingsTotal: result.user_ratings_total,
    priceLevel: result.price_level,
    types: result.types ?? [],
    photoRef: result.photos?.[0]?.getUrl({ maxWidth: 400 }),
  }
}

function nearbySearch(
  service: google.maps.places.PlacesService,
  request: google.maps.places.PlaceSearchRequest
): Promise<google.maps.places.PlaceResult[]> {
  return new Promise((resolve, reject) => {
    service.nearbySearch(request, (results, status) => {
      if (status === google.maps.places.PlacesServiceStatus.OK && results) {
        resolve(results)
      } else if (status === google.maps.places.PlacesServiceStatus.ZERO_RESULTS) {
        resolve([])
      } else {
        reject(new Error(`Places API error: ${status}`))
      }
    })
  })
}

/**
 * Search for restaurants near the midpoint using Google Places Nearby Search,
 * expanding radius if needed, falling back to shopping malls.
 */
export async function searchWithFallback(
  service: google.maps.places.PlacesService,
  midpoint: LatLng
): Promise<FallbackResult> {
  const location = new google.maps.LatLng(midpoint.lat, midpoint.lng)

  for (const radius of RADIUS_STEPS) {
    const raw = await nearbySearch(service, { location, radius, type: 'restaurant' })

    if (raw.length > 0) {
      const places = raw.map(mapPlaceResult).filter(Boolean) as PlaceResult[]
      return {
        places,
        searchRadius: radius,
        usedFallback: radius > RADIUS_STEPS[0],
        fallbackType: radius > RADIUS_STEPS[0] ? 'radius' : undefined,
      }
    }
  }

  // All restaurant radii exhausted — try shopping malls
  const raw = await nearbySearch(service, {
    location,
    radius: RADIUS_STEPS[RADIUS_STEPS.length - 1],
    type: 'shopping_mall',
  })

  const places = raw.map(mapPlaceResult).filter(Boolean) as PlaceResult[]
  return {
    places,
    searchRadius: RADIUS_STEPS[RADIUS_STEPS.length - 1],
    usedFallback: true,
    fallbackType: 'shopping_mall',
  }
}
