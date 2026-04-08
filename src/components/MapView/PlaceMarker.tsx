import { Marker, InfoWindow } from '@react-google-maps/api'
import { useAppStore } from '../../store/appStore'
import type { PlaceResult } from '../../types'

interface Props {
  place: PlaceResult
}

export function PlaceMarker({ place }: Props) {
  const { selectedPlaceId, setSelectedPlaceId } = useAppStore()
  const isSelected = selectedPlaceId === place.placeId

  return (
    <>
      <Marker
        position={place.location}
        onClick={() => setSelectedPlaceId(isSelected ? null : place.placeId)}
        title={place.name}
        zIndex={isSelected ? 10 : 1}
      />
      {isSelected && (
        <InfoWindow
          position={place.location}
          onCloseClick={() => setSelectedPlaceId(null)}
        >
          <div className="max-w-[200px]">
            <p className="font-semibold text-sm text-gray-900">{place.name}</p>
            <p className="text-xs text-gray-500 mt-0.5">{place.address}</p>
            {place.rating !== undefined && (
              <p className="text-xs text-yellow-500 mt-0.5">
                {'★'.repeat(Math.round(place.rating))} {place.rating.toFixed(1)}
              </p>
            )}
          </div>
        </InfoWindow>
      )}
    </>
  )
}
