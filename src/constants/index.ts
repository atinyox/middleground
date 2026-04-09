import type { LatLng } from '../types'

export const MIN_ADDRESSES = 2
export const MAX_ADDRESSES = 6

// Places search radius ladder (meters)
export const RADIUS_STEPS: number[] = [5000, 10000, 25000]
export const FALLBACK_TYPE = 'shopping_mall'

export const DEFAULT_MAP_CENTER: LatLng = { lat: 37.5, lng: -122.05 }
export const DEFAULT_MAP_ZOOM = 10
export const RESULT_MAP_ZOOM = 12
