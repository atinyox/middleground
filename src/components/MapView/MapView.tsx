import { useCallback, useEffect } from 'react'
import { GoogleMap } from '@react-google-maps/api'
import { useAppStore } from '../../store/appStore'
import { DEFAULT_MAP_CENTER, DEFAULT_MAP_ZOOM } from '../../constants'
import { AddressMarker } from './AddressMarker'
import { MidpointMarker } from './MidpointMarker'
import { PlaceMarker } from './PlaceMarker'

const MAP_CONTAINER_STYLE = { width: '100%', height: '100%' }

const MAP_OPTIONS: google.maps.MapOptions = {
  mapTypeControl: false,
  streetViewControl: false,
  fullscreenControl: true,
  zoomControl: true,
  clickableIcons: false,
}

export function MapView() {
  const { addresses, searchState, setMapRef, mapRef } = useAppStore()

  const onLoad = useCallback(
    (map: google.maps.Map) => setMapRef(map),
    [setMapRef]
  )

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

  return (
    <GoogleMap
      mapContainerStyle={MAP_CONTAINER_STYLE}
      center={DEFAULT_MAP_CENTER}
      zoom={DEFAULT_MAP_ZOOM}
      options={MAP_OPTIONS}
      onLoad={onLoad}
    >
      {addresses.map((a, i) =>
        a.geocoded ? (
          <AddressMarker key={a.id} position={a.geocoded} label={String(i + 1)} />
        ) : null
      )}

      {searchState.geographicMidpoint && (
        <MidpointMarker position={searchState.geographicMidpoint} />
      )}

      {searchState.places.map((p) => (
        <PlaceMarker key={p.placeId} place={p} />
      ))}
    </GoogleMap>
  )
}
