import { create } from 'zustand'
import type { AddressEntry, SearchState } from '../types'
import type { MapRef } from 'react-map-gl/mapbox'
import { MIN_ADDRESSES } from '../constants'

function makeBlankEntry(id: string): AddressEntry {
  return { id, raw: '', geocoded: null }
}

interface AppStore {
  // Address management
  addresses: AddressEntry[]
  addAddress: () => void
  removeAddress: (id: string) => void
  updateAddress: (id: string, raw: string, geocoded?: { lat: number; lng: number } | null, placeId?: string) => void

  // Search results
  searchState: SearchState
  setSearchState: (update: Partial<SearchState>) => void
  resetSearch: () => void

  // Drive time toggle
  driveTimeEnabled: boolean
  setDriveTimeEnabled: (enabled: boolean) => void

  // Map interaction
  selectedPlaceId: string | null
  setSelectedPlaceId: (id: string | null) => void

  // Map instance (for flyTo, fitBounds)
  mapRef: MapRef | null
  setMapRef: (map: MapRef) => void
}

const initialSearchState: SearchState = {
  status: 'idle',
  places: [],
  driveTimePlaces: [],
  searchRadius: 5000,
  usedFallback: false,
}

let _nextId = 1
const nextId = () => String(_nextId++)

export const useAppStore = create<AppStore>((set) => ({
  addresses: [makeBlankEntry(nextId()), makeBlankEntry(nextId())],

  addAddress: () =>
    set((s) => ({
      addresses:
        s.addresses.length < 6
          ? [...s.addresses, makeBlankEntry(nextId())]
          : s.addresses,
    })),

  removeAddress: (id) =>
    set((s) => ({
      addresses:
        s.addresses.length > MIN_ADDRESSES
          ? s.addresses.filter((a) => a.id !== id)
          : s.addresses,
    })),

  updateAddress: (id, raw, geocoded, placeId) =>
    set((s) => ({
      addresses: s.addresses.map((a) =>
        a.id === id
          ? { ...a, raw, geocoded: geocoded ?? null, placeId }
          : a
      ),
    })),

  searchState: initialSearchState,
  setSearchState: (update) =>
    set((s) => ({ searchState: { ...s.searchState, ...update } })),
  resetSearch: () => set({ searchState: initialSearchState }),

  driveTimeEnabled: false,
  setDriveTimeEnabled: (enabled) => set({ driveTimeEnabled: enabled }),

  selectedPlaceId: null,
  setSelectedPlaceId: (id) => set({ selectedPlaceId: id }),

  mapRef: null,
  setMapRef: (map) => set({ mapRef: map }),
}))

// Selectors
export const selectCanSearch = (s: AppStore) =>
  s.addresses.filter((a) => a.geocoded !== null).length >= MIN_ADDRESSES &&
  s.searchState.status !== 'computing' &&
  s.searchState.status !== 'searching'

export const selectCanAdd = (s: AppStore) => s.addresses.length < 6
export const selectCanRemove = (s: AppStore) => s.addresses.length > MIN_ADDRESSES
