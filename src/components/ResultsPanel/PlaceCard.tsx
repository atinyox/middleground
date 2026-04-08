import { useAppStore } from '../../store/appStore'
import type { PlaceResult } from '../../types'
import { haversineDistance, formatDistance } from '../../utils/geo'
import { RESULT_MAP_ZOOM } from '../../constants'

interface Props {
  place: PlaceResult
}

function PriceLevel({ level }: { level: number }) {
  return (
    <span className="text-green-600 text-xs">
      {'$'.repeat(level)}<span className="text-gray-300">{'$'.repeat(4 - level)}</span>
    </span>
  )
}

function Stars({ rating }: { rating: number }) {
  const full = Math.round(rating)
  return (
    <span className="text-yellow-400 text-xs" aria-label={`${rating} stars`}>
      {'★'.repeat(full)}{'☆'.repeat(5 - full)}
    </span>
  )
}

export function PlaceCard({ place }: Props) {
  const { selectedPlaceId, setSelectedPlaceId, mapRef, searchState } = useAppStore()
  const isSelected = selectedPlaceId === place.placeId
  const midpoint = searchState.geographicMidpoint
  const distMeters = midpoint ? haversineDistance(midpoint, place.location) : null

  const handleClick = () => {
    setSelectedPlaceId(isSelected ? null : place.placeId)
    if (mapRef) {
      mapRef.panTo(place.location)
      mapRef.setZoom(RESULT_MAP_ZOOM)
    }
  }

  const mapsUrl = `https://www.google.com/maps/place/?q=place_id:${place.placeId}`
  const yelpUrl = `https://www.yelp.com/search?find_desc=${encodeURIComponent(place.name)}&find_loc=${encodeURIComponent(place.address)}`

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={(e) => e.key === 'Enter' && handleClick()}
      className={`w-full text-left rounded-lg border p-3 transition-all cursor-pointer
        ${isSelected
          ? 'border-blue-400 bg-blue-50 shadow-sm'
          : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
        }`}
    >
      <div className="flex gap-3">
        {place.photoRef && (
          <img
            src={place.photoRef}
            alt={place.name}
            className="h-14 w-14 flex-shrink-0 rounded-md object-cover"
          />
        )}
        <div className="min-w-0 flex-1">
          <p className="font-medium text-sm text-gray-900 truncate">{place.name}</p>
          <p className="text-xs text-gray-500 truncate mt-0.5">{place.address}</p>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            {place.rating !== undefined && (
              <>
                <Stars rating={place.rating} />
                <span className="text-xs text-gray-500">
                  {place.rating.toFixed(1)}
                  {place.userRatingsTotal !== undefined && (
                    <span className="text-gray-400"> ({place.userRatingsTotal.toLocaleString()})</span>
                  )}
                </span>
              </>
            )}
            {place.priceLevel !== undefined && (
              <PriceLevel level={place.priceLevel} />
            )}
            {distMeters !== null && (
              <span className="text-xs text-gray-400">
                {formatDistance(distMeters)} from midpoint
              </span>
            )}
          </div>
          <div className="flex gap-2 mt-1.5">
            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="text-xs text-blue-600 hover:underline"
            >
              Maps
            </a>
            <a
              href={yelpUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="text-xs text-red-500 hover:underline"
            >
              Yelp
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
