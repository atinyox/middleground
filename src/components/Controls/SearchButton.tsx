import { useAppStore, selectCanSearch } from '../../store/appStore'
import { useMidpointSearch } from '../../hooks/useMidpointSearch'
import { Spinner } from '../common/Spinner'

export function SearchButton() {
  const searchState = useAppStore((s) => s.searchState)
  const canSearch = useAppStore(selectCanSearch)
  const { runSearch } = useMidpointSearch()

  const isLoading =
    searchState.status === 'computing' || searchState.status === 'searching'

  return (
    <button
      onClick={runSearch}
      disabled={!canSearch || isLoading}
      className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white
        hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed
        transition-colors flex items-center justify-center gap-2"
    >
      {isLoading ? (
        <>
          <Spinner size="sm" />
          {searchState.status === 'computing' ? 'Computing midpoint…' : 'Searching…'}
        </>
      ) : (
        'Find Midpoint'
      )}
    </button>
  )
}
