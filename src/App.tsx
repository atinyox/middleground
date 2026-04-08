import { useState } from 'react'
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
  const [sidebarOpen, setSidebarOpen] = useState(false)

  if (loadError) {
    return (
      <div className="flex h-screen items-center justify-center text-red-600 text-sm">
        Failed to load Google Maps: {loadError.message}
      </div>
    )
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-30 flex w-80 flex-col border-r border-gray-200 bg-white shadow-sm overflow-hidden
          transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          md:static md:w-96 md:translate-x-0
        `}
      >
        <div className="px-4 py-4 border-b border-gray-100 flex items-start justify-between">
          <div>
            <h1 className="text-lg font-bold text-gray-900 tracking-tight">
              Middleground
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Find the perfect midpoint for your group
            </p>
          </div>
          {/* Close button — mobile only */}
          <button
            className="md:hidden ml-2 p-1 text-gray-400 hover:text-gray-600 transition-colors"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close sidebar"
          >
            <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
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

      {/* Map */}
      <main className="flex-1 relative">
        {isLoaded ? (
          <MapView />
        ) : (
          <div className="flex h-full items-center justify-center">
            <div className="text-sm text-gray-400">Loading map…</div>
          </div>
        )}

        {/* Floating open button — mobile only */}
        <button
          className="md:hidden absolute top-3 left-3 z-10 flex items-center gap-1.5 rounded-lg bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-md border border-gray-200 hover:bg-gray-50 transition-colors"
          onClick={() => setSidebarOpen(true)}
          aria-label="Open sidebar"
        >
          <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
          </svg>
          Menu
        </button>
      </main>
    </div>
  )
}
