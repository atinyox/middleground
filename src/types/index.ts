export interface LatLng {
  lat: number
  lng: number
}

export interface AddressEntry {
  id: string
  raw: string
  geocoded: LatLng | null
  placeId?: string
}

export interface PlaceResult {
  placeId: string
  name: string
  address: string
  location: LatLng
  rating?: number
  userRatingsTotal?: number
  priceLevel?: number
  types: string[]
  photoRef?: string
}

export type SearchStatus = 'idle' | 'computing' | 'searching' | 'done' | 'error'

export interface SearchState {
  status: SearchStatus
  error?: string
  geographicMidpoint?: LatLng
  driveTimeMidpoint?: LatLng
  places: PlaceResult[]
  driveTimePlaces: PlaceResult[]
  searchRadius: number
  usedFallback: boolean
  fallbackType?: 'radius' | 'shopping_mall'
}
