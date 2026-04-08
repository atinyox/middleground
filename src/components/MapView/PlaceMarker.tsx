import { Marker, Popup } from 'react-map-gl/mapbox'
import { useAppStore } from '../../store/appStore'
import type { PlaceResult } from '../../types'

interface Props {
  place: PlaceResult
  isDriveTime?: boolean
}

export function PlaceMarker({ place, isDriveTime = false }: Props) {
  const { selectedPlaceId, setSelectedPlaceId } = useAppStore()
  const isSelected = selectedPlaceId === place.placeId
  const color = isDriveTime ? '#F59E0B' : '#EF4444'

  return (
    <>
      <Marker
        latitude={place.location.lat}
        longitude={place.location.lng}
        anchor="bottom"
      >
        <button
          onClick={() => setSelectedPlaceId(isSelected ? null : place.placeId)}
          title={place.name}
          aria-label={place.name}
          className="hover:scale-125 transition-transform"
          style={{ color }}
        >
          <svg width="20" height="28" viewBox="0 0 20 28" fill="currentColor">
            <path d="M10 0C4.48 0 0 4.48 0 10c0 7.5 10 18 10 18s10-10.5 10-18c0-5.52-4.48-10-10-10z" />
            <circle cx="10" cy="10" r="4" fill="white" />
          </svg>
        </button>
      </Marker>

      {isSelected && (
        <Popup
          latitude={place.location.lat}
          longitude={place.location.lng}
          anchor="bottom"
          onClose={() => setSelectedPlaceId(null)}
          closeOnClick={false}
          offset={32}
          maxWidth="220px"
        >
          <div>
            <p className="font-semibold text-sm text-gray-900">{place.name}</p>
            <p className="text-xs text-gray-500 mt-0.5">{place.address}</p>
            {place.rating !== undefined && (
              <p className="text-xs text-yellow-500 mt-0.5">
                {'★'.repeat(Math.round(place.rating))} {place.rating.toFixed(1)}
              </p>
            )}
          </div>
        </Popup>
      )}
    </>
  )
}
