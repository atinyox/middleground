import { useAppStore } from './store/appStore'
import { ApiKeyGate } from './components/common/ApiKeyGate'
import { AddressPanel } from './components/AddressPanel/AddressPanel'
import { MapView } from './components/MapView/MapView'
import { ResultsPanel } from './components/ResultsPanel/ResultsPanel'
import { SearchButton } from './components/Controls/SearchButton'
import { ErrorBanner } from './components/common/ErrorBanner'

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN

export default function App() {
  if (!MAPBOX_TOKEN) return <ApiKeyGate />
  return <AppInner />
}

function AppInner() {
  const searchState = useAppStore((s) => s.searchState)

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
          <AddressPanel />
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
        <MapView />
      </main>
    </div>
  )
}
