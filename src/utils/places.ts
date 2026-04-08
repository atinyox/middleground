import type { LatLng, PlaceResult } from '../types'
import { RADIUS_STEPS } from '../constants'

const SEARCH_BASE = 'https://api.mapbox.com/search/searchbox/v1/category'

// Mapbox Search Box category canonical names
const CAT_RESTAURANT = 'restaurant'
const CAT_SHOPPING_MALL = 'shopping_mall'

interface MbxFeature {
  type: 'Feature'
  geometry: { type: 'Point'; coordinates: [number, number] }
  properties: {
    mapbox_id: string
    name: string
    full_address?: string
    place_formatted?: string
    poi_category?: string[]
  }
}

interface MbxCategoryResponse {
  features: MbxFeature[]
}

/** Convert a center + radius (meters) to a bbox string for Mapbox. */
function radiusToBbox(center: LatLng, radiusM: number): string {
  const latDelta = radiusM / 111_320
  const lngDelta = radiusM / (111_320 * Math.cos((center.lat * Math.PI) / 180))
  return [
    center.lng - lngDelta,
    center.lat - latDelta,
    center.lng + lngDelta,
    center.lat + latDelta,
  ]
    .map((v) => v.toFixed(6))
    .join(',')
}

function mapFeature(f: MbxFeature): PlaceResult {
  const [lng, lat] = f.geometry.coordinates
  return {
    placeId: f.properties.mapbox_id,
    name: f.properties.name,
    address: f.properties.full_address ?? f.properties.place_formatted ?? '',
    location: { lat, lng },
    types: f.properties.poi_category ?? [],
  }
}

async function categorySearch(
  token: string,
  midpoint: LatLng,
  radiusM: number,
  category: string
): Promise<PlaceResult[]> {
  const params = new URLSearchParams({
    access_token: token,
    proximity: `${midpoint.lng},${midpoint.lat}`,
    bbox: radiusToBbox(midpoint, radiusM),
    limit: '10',   // Mapbox Search Box API maximum is 10
    language: 'en',
  })

  const res = await fetch(`${SEARCH_BASE}/${category}?${params}`)
  if (!res.ok) {
    const body = await res.text().catch(() => '')
    throw new Error(`Mapbox Search API error: ${res.status} ${res.statusText}${body ? ` — ${body}` : ''}`)
  }

  const data = (await res.json()) as MbxCategoryResponse
  return data.features.map(mapFeature)
}

export interface FallbackResult {
  places: PlaceResult[]
  searchRadius: number
  usedFallback: boolean
  fallbackType?: 'radius' | 'shopping_mall'
}

/**
 * Search for restaurants near the midpoint using Mapbox Search Box API,
 * expanding radius if needed, falling back to shopping malls.
 */
export async function searchWithFallback(
  mapboxToken: string,
  midpoint: LatLng
): Promise<FallbackResult> {
  for (const radius of RADIUS_STEPS) {
    const places = await categorySearch(
      mapboxToken,
      midpoint,
      radius,
      CAT_RESTAURANT
    )

    if (places.length > 0) {
      return {
        places,
        searchRadius: radius,
        usedFallback: radius > RADIUS_STEPS[0],
        fallbackType: radius > RADIUS_STEPS[0] ? 'radius' : undefined,
      }
    }
  }

  // All restaurant radii exhausted — try shopping malls
  const places = await categorySearch(
    mapboxToken,
    midpoint,
    RADIUS_STEPS[RADIUS_STEPS.length - 1],
    CAT_SHOPPING_MALL
  )

  return {
    places,
    searchRadius: RADIUS_STEPS[RADIUS_STEPS.length - 1],
    usedFallback: true,
    fallbackType: 'shopping_mall',
  }
}
