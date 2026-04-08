import { useLoadScript } from '@react-google-maps/api'
import { useAppStore } from './store/appStore'
import { ApiKeyGate } from './components/common/ApiKeyGate'
import { AddressPanel } from './components/AddressPanel/AddressPanel'
import { MapView } from './components/MapView/MapView'
import { ResultsPanel } from './components/ResultsPanel/ResultsPanel'
import { SearchButton } from './components/Controls/SearchButton'
import { ErrorBanner } from './components/common/ErrorBanner'

const LIBRARIES: ('places')[] = ['places']
const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY

export default function App() {
  if (!API_KEY) return <ApiKeyGate />
  return <AppInner />
}

function AppInner() {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: API_KEY,
    libraries: LIBRARIES,
  })

  const searchState = useAppStore((s) => s.searchState)

  if (loadError) {
    return (
      <div className="flex h-screen items-center justify-center text-red-600 text-sm">
        Failed to load Google Maps: {loadError.message}
      </div>
    )
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <aside className="w-96 flex flex-col border-r border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="px-4 py-4 border-b border-gray-100">
          <h1 className="text-lg font-bold text-gray-900 tracking-tight">
            Middleground
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Find the perfect midpoint for your group
          </p>
        </div>

        <div className="pt-4 pb-3">
          <AddressPanel isLoaded={isLoaded} />
        </div>

        <div className="px-4 pb-4 border-b border-gray-100">
          <SearchButton />
        </div>

        {searchState.status === 'error' && searchState.error && (
          <ErrorBanner message={searchState.error} />
        )}

        <div className="flex-1 overflow-y-auto pt-3">
          <ResultsPanel />
        </div>
      </aside>

      <main className="flex-1 relative">
        {isLoaded ? (
          <MapView />
        ) : (
          <div className="flex h-full items-center justify-center">
            <div className="text-sm text-gray-400">Loading map…</div>
          </div>
        )}
      </main>
    </div>
  )
}
