import { useState } from 'react'
import { useAppStore } from '../../store/appStore'
import { PlaceCard } from './PlaceCard'
import { EmptyState } from './EmptyState'
import { Spinner } from '../common/Spinner'
import { haversineDistance } from '../../utils/geo'

type SortBy = 'distance' | 'rating' | 'reviews'

export function ResultsPanel() {
  const { searchState } = useAppStore()
  const { status, places, usedFallback, fallbackType, error } = searchState
  const [sortBy, setSortBy] = useState<SortBy>('distance')

  const isLoading = status === 'computing' || status === 'searching'

  if (status === 'idle') return <EmptyState />

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-10 gap-3">
        <Spinner />
        <p className="text-sm text-gray-500">
          {status === 'computing' ? 'Computing midpoint…' : 'Searching for restaurants…'}
        </p>
      </div>
    )
  }

  if (status === 'error' && places.length === 0) {
    return (
      <div className="px-4 py-4 text-sm text-red-600">
        {error ?? 'Something went wrong.'}
      </div>
    )
  }

  const midpoint = searchState.geographicMidpoint
  const sorted = [...places].sort((a, b) => {
    if (sortBy === 'distance') {
      if (!midpoint) return 0
      return haversineDistance(midpoint, a.location) - haversineDistance(midpoint, b.location)
    }
    if (sortBy === 'rating') {
      return (b.rating ?? -1) - (a.rating ?? -1)
    }
    return (b.userRatingsTotal ?? -1) - (a.userRatingsTotal ?? -1)
  })

  return (
    <div className="overflow-y-auto px-4 pb-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-400">
          Nearby restaurants
        </h3>
        <span className="text-xs text-gray-400">{places.length} results</span>
      </div>

      {places.length > 0 && (
        <div className="flex gap-1.5 mb-2">
          {(['distance', 'rating', 'reviews'] as const).map((opt) => (
            <button
              key={opt}
              onClick={() => setSortBy(opt)}
              className={`px-2.5 py-0.5 rounded-full text-xs font-medium transition-colors
                ${sortBy === opt
                  ? 'bg-blue-600 text-white'
                  : 'border border-gray-300 text-gray-500 hover:border-gray-400'
                }`}
            >
              {opt === 'distance' ? 'Distance' : opt === 'rating' ? 'Rating' : 'Reviews'}
            </button>
          ))}
        </div>
      )}

      {usedFallback && (
        <p className="text-xs text-amber-600 mb-2 bg-amber-50 rounded px-2 py-1.5 border border-amber-100">
          {fallbackType === 'shopping_mall'
            ? 'No restaurants found nearby — showing shopping centers instead.'
            : `No restaurants within 5 km — expanded search to ${searchState.searchRadius / 1000} km.`}
        </p>
      )}

      {sorted.length === 0 ? (
        <p className="text-sm text-gray-500 py-2">No results found in this area.</p>
      ) : (
        <div className="space-y-2">
          {sorted.map((p) => (
            <PlaceCard key={p.placeId} place={p} />
          ))}
        </div>
      )}
    </div>
  )
}
