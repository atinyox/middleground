import { useCallback, useEffect, useRef } from 'react'
import Map, { type MapRef } from 'react-map-gl/mapbox'
import 'mapbox-gl/dist/mapbox-gl.css'
import { useAppStore } from '../../store/appStore'
import { DEFAULT_MAP_CENTER, DEFAULT_MAP_ZOOM } from '../../constants'
import { AddressMarker } from './AddressMarker'
import { MidpointMarker } from './MidpointMarker'
import { DriveTimeMarker } from './DriveTimeMarker'
import { PlaceMarker } from './PlaceMarker'

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN

export function MapView() {
  const { addresses, searchState, driveTimeEnabled, setMapRef } = useAppStore()
  const mapRef = useRef<MapRef>(null)

  const onLoad = useCallback(() => {
    if (mapRef.current) setMapRef(mapRef.current)
  }, [setMapRef])

  // Fit bounds to all visible points whenever results arrive or change
  useEffect(() => {
    const map = mapRef.current
    if (!map || searchState.status !== 'done') return

    const lngs: number[] = []
    const lats: number[] = []

    for (const a of addresses) {
      if (a.geocoded) {
        lngs.push(a.geocoded.lng)
        lats.push(a.geocoded.lat)
      }
    }
    if (searchState.geographicMidpoint) {
      lngs.push(searchState.geographicMidpoint.lng)
      lats.push(searchState.geographicMidpoint.lat)
    }
    if (searchState.driveTimeMidpoint) {
      lngs.push(searchState.driveTimeMidpoint.lng)
      lats.push(searchState.driveTimeMidpoint.lat)
    }
    for (const p of searchState.places) {
      lngs.push(p.location.lng)
      lats.push(p.location.lat)
    }

    if (lngs.length === 0) return

    map.fitBounds(
      [
        [Math.min(...lngs), Math.min(...lats)],
        [Math.max(...lngs), Math.max(...lats)],
      ],
      { padding: 60, maxZoom: 14, duration: 800 }
    )
  }, [searchState, addresses])

  return (
    <Map
      ref={mapRef}
      mapboxAccessToken={MAPBOX_TOKEN}
      initialViewState={{
        longitude: DEFAULT_MAP_CENTER.lng,
        latitude: DEFAULT_MAP_CENTER.lat,
        zoom: DEFAULT_MAP_ZOOM,
      }}
      style={{ width: '100%', height: '100%' }}
      mapStyle="mapbox://styles/mapbox/streets-v12"
      onLoad={onLoad}
    >
      {addresses.map((a, i) =>
        a.geocoded ? (
          <AddressMarker key={a.id} position={a.geocoded} label={String(i + 1)} />
        ) : null
      )}

      {searchState.geographicMidpoint && (
        <MidpointMarker
          position={searchState.geographicMidpoint}
          label="Geographic midpoint"
          color="#8B5CF6"
        />
      )}

      {driveTimeEnabled && searchState.driveTimeMidpoint && (
        <DriveTimeMarker position={searchState.driveTimeMidpoint} />
      )}

      {searchState.places.map((p) => (
        <PlaceMarker key={p.placeId} place={p} />
      ))}

      {driveTimeEnabled &&
        searchState.driveTimePlaces.map((p) => (
          <PlaceMarker key={`dt-${p.placeId}`} place={p} isDriveTime />
        ))}
    </Map>
  )
}
