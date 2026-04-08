import type { LatLng } from '../types'

export const MIN_ADDRESSES = 2
export const MAX_ADDRESSES = 6

// Places search radius ladder (meters)
export const RADIUS_STEPS: number[] = [5000, 10000, 25000]
export const FALLBACK_TYPE = 'shopping_mall'

// Drive-time grid sampling
export const GRID_RADIUS_KM = 20    // how far from geo center to sample
export const GRID_STEPS = 4         // (2*4+1)² = 81 candidates

// How far apart geo and drive-time midpoints must be to show alternate (meters)
export const MIDPOINT_DIFF_THRESHOLD = 2000

export const DEFAULT_MAP_CENTER: LatLng = { lat: 39.5, lng: -98.35 }
export const DEFAULT_MAP_ZOOM = 4
export const RESULT_MAP_ZOOM = 12
