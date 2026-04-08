import { useAppStore } from '../../store/appStore'
import { PlaceCard } from './PlaceCard'
import { EmptyState } from './EmptyState'
import { Spinner } from '../common/Spinner'

export function ResultsPanel() {
  const { searchState, driveTimeEnabled } = useAppStore()
  const { status, places, driveTimePlaces, usedFallback, fallbackType, error } = searchState

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

  return (
    <div className="flex flex-col gap-4 overflow-y-auto px-4 pb-4">
      {/* Geographic midpoint results */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-400">
            {driveTimeEnabled ? 'Geographic midpoint' : 'Nearby restaurants'}
          </h3>
          <span className="text-xs text-gray-400">{places.length} results</span>
        </div>

        {usedFallback && (
          <p className="text-xs text-amber-600 mb-2 bg-amber-50 rounded px-2 py-1.5 border border-amber-100">
            {fallbackType === 'shopping_mall'
              ? 'No restaurants found nearby — showing shopping centers instead.'
              : `No restaurants within 5 km — expanded search to ${searchState.searchRadius / 1000} km.`}
          </p>
        )}

        {places.length === 0 ? (
          <p className="text-sm text-gray-500 py-2">No results found in this area.</p>
        ) : (
          <div className="space-y-2">
            {places.map((p) => (
              <PlaceCard key={p.placeId} place={p} midpointLabel="geo" />
            ))}
          </div>
        )}
      </div>

      {/* Drive-time midpoint results */}
      {driveTimeEnabled && searchState.driveTimeMidpoint && driveTimePlaces.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-amber-600">
              Drive-time midpoint
            </h3>
            <span className="text-xs text-gray-400">{driveTimePlaces.length} results</span>
          </div>
          <div className="space-y-2">
            {driveTimePlaces.map((p) => (
              <PlaceCard key={p.placeId} place={p} midpointLabel="drive" />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
