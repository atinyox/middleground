import { useCallback, useEffect, useRef, useState } from 'react'
import { GoogleMap, Marker } from '@react-google-maps/api'
import { useAppStore } from '../../store/appStore'
import { DEFAULT_MAP_CENTER, DEFAULT_MAP_ZOOM, MIN_ADDRESSES } from '../../constants'
import { AddressMarker } from './AddressMarker'
import { MidpointMarker } from './MidpointMarker'
import { PlaceMarker } from './PlaceMarker'
import { pixelToLatLng } from '../../utils/geo'
import { reverseGeocode } from '../../utils/places'
import { useMidpointSearch } from '../../hooks/useMidpointSearch'
import type { LatLng } from '../../types'

const MAP_CONTAINER_STYLE = { width: '100%', height: '100%' }

const MAP_OPTIONS: google.maps.MapOptions = {
  mapTypeControl: false,
  streetViewControl: false,
  fullscreenControl: true,
  zoomControl: true,
  clickableIcons: false,
}

export function MapView() {
  const { addresses, searchState, setMapRef, mapRef, updateAddress, removeAddress, draggingPinId, setDraggingPinId } = useAppStore()
  const { runSearch } = useMidpointSearch()
  const didInitialFit = useRef(false)
  const [dropPreview, setDropPreview] = useState<LatLng | null>(null)

  const onLoad = useCallback(
    (map: google.maps.Map) => setMapRef(map),
    [setMapRef]
  )

  // On initial load: if addresses were pre-populated from a shared URL, zoom to fit them.
  // Runs only once when mapRef is first available — not on every address change.
  useEffect(() => {
    if (didInitialFit.current || !mapRef || searchState.status !== 'idle') return
    const geocoded = addresses.filter((a) => a.geocoded).map((a) => a.geocoded!)
    if (geocoded.length === 0) return
    const bounds = new google.maps.LatLngBounds()
    geocoded.forEach((loc) => bounds.extend(loc))
    mapRef.fitBounds(bounds, 80)
    didInitialFit.current = true
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapRef])

  // Fit bounds to all visible points whenever results arrive or change
  useEffect(() => {
    if (!mapRef || searchState.status !== 'done') return

    const bounds = new google.maps.LatLngBounds()
    let hasPoints = false

    for (const a of addresses) {
      if (a.geocoded) {
        bounds.extend(a.geocoded)
        hasPoints = true
      }
    }
    if (searchState.geographicMidpoint) {
      bounds.extend(searchState.geographicMidpoint)
      hasPoints = true
    }
    for (const p of searchState.places) {
      bounds.extend(p.location)
      hasPoints = true
    }

    if (hasPoints) mapRef.fitBounds(bounds, 60)
  }, [searchState, addresses, mapRef])

  const autoSearch = useCallback(() => {
    const current = useAppStore.getState().addresses
    if (current.filter((a) => a.geocoded).length >= MIN_ADDRESSES) {
      runSearch()
    }
  }, [runSearch])

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    if (!mapRef) return
    const rect = e.currentTarget.getBoundingClientRect()
    setDropPreview(pixelToLatLng(mapRef, e.clientX - rect.left, e.clientY - rect.top))
  }, [mapRef])

  const handleDrop = useCallback(async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setDraggingPinId(null)
    setDropPreview(null)
    const id = e.dataTransfer.getData('addressId')
    if (!id || !mapRef) return
    const rect = e.currentTarget.getBoundingClientRect()
    const latLng = pixelToLatLng(mapRef, e.clientX - rect.left, e.clientY - rect.top)
    updateAddress(id, 'Placing pin\u2026', latLng)
    const address = await reverseGeocode(latLng)
    updateAddress(id, address, latLng)
    autoSearch()
  }, [mapRef, updateAddress, setDraggingPinId, autoSearch])

  const handleMarkerDragEnd = useCallback(async (id: string, latLng: { lat: number; lng: number }) => {
    updateAddress(id, 'Placing pin\u2026', latLng)
    const address = await reverseGeocode(latLng)
    updateAddress(id, address, latLng)
    autoSearch()
  }, [updateAddress, autoSearch])

  const isDragging = draggingPinId !== null
  const canRemove = addresses.length > MIN_ADDRESSES

  // Find the label for the ghost marker (index of the address being dragged)
  const draggingIndex = draggingPinId ? addresses.findIndex((a) => a.id === draggingPinId) : -1
  const ghostLabel = draggingIndex >= 0 ? String(draggingIndex + 1) : ''

  return (
    <div className="relative w-full h-full">
      {isDragging && (
        <div
          className="absolute inset-0 z-10 bg-blue-400/20 ring-4 ring-inset ring-blue-400/60"
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onDragLeave={() => setDropPreview(null)}
        />
      )}
      <GoogleMap
        mapContainerStyle={MAP_CONTAINER_STYLE}
        center={DEFAULT_MAP_CENTER}
        zoom={DEFAULT_MAP_ZOOM}
        options={MAP_OPTIONS}
        onLoad={onLoad}
      >
        {addresses.map((a, i) =>
          a.geocoded ? (
            <AddressMarker
              key={a.id}
              id={a.id}
              position={a.geocoded}
              label={String(i + 1)}
              canRemove={canRemove}
              onDragEnd={handleMarkerDragEnd}
              onRemove={removeAddress}
            />
          ) : null
        )}

        {/* Ghost marker showing where the pin will land */}
        {dropPreview && ghostLabel && (
          <Marker
            position={dropPreview}
            label={{ text: ghostLabel, color: 'white', fontWeight: 'bold', fontSize: '12px' }}
            icon={{
              path: google.maps.SymbolPath.CIRCLE,
              scale: 14,
              fillColor: '#3B82F6',
              fillOpacity: 0.5,
              strokeColor: 'white',
              strokeWeight: 2,
              strokeOpacity: 0.6,
            }}
            zIndex={20}
          />
        )}

        {searchState.geographicMidpoint && (
          <MidpointMarker position={searchState.geographicMidpoint} />
        )}

        {searchState.places.map((p) => (
          <PlaceMarker key={p.placeId} place={p} />
        ))}
      </GoogleMap>
    </div>
  )
}
