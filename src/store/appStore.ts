import { create } from 'zustand'
import type { AddressEntry, LatLng, SearchState } from '../types'
import { MIN_ADDRESSES, MAX_ADDRESSES } from '../constants'

function makeBlankEntry(id: string): AddressEntry {
  return { id, raw: '', geocoded: null }
}

interface AppStore {
  // Address management
  addresses: AddressEntry[]
  addAddress: () => void
  removeAddress: (id: string) => void
  updateAddress: (id: string, raw: string, geocoded?: { lat: number; lng: number } | null, placeId?: string) => void
  hydrateAddresses: (entries: { raw: string; geocoded: LatLng; placeId?: string }[]) => void

  // Search results
  searchState: SearchState
  setSearchState: (update: Partial<SearchState>) => void
  resetSearch: () => void

  // Map interaction
  selectedPlaceId: string | null
  setSelectedPlaceId: (id: string | null) => void

  // Map instance (for panTo, fitBounds)
  mapRef: google.maps.Map | null
  setMapRef: (map: google.maps.Map) => void
}

const initialSearchState: SearchState = {
  status: 'idle',
  places: [],
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

  hydrateAddresses: (entries) => {
    const capped = entries.slice(0, MAX_ADDRESSES)
    const hydrated: AddressEntry[] = capped.map((e) => ({
      id: nextId(),
      raw: e.raw,
      geocoded: e.geocoded,
      placeId: e.placeId,
    }))
    // Pad up to MIN_ADDRESSES with blanks if needed
    while (hydrated.length < MIN_ADDRESSES) {
      hydrated.push(makeBlankEntry(nextId()))
    }
    set({ addresses: hydrated })
  },

  searchState: initialSearchState,
  setSearchState: (update) =>
    set((s) => ({ searchState: { ...s.searchState, ...update } })),
  resetSearch: () => set({ searchState: initialSearchState }),

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
