import { useEffect, useRef, useState, useCallback } from 'react'
import { useAppStore, selectCanRemove } from '../../store/appStore'
import type { AddressEntry } from '../../types'

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN
const GEOCODE_URL = 'https://api.mapbox.com/geocoding/v5/mapbox.places'

interface Suggestion {
  id: string
  place_name: string
  center: [number, number] // [lng, lat]
}

interface Props {
  entry: AddressEntry
  index: number
}

export function AddressInput({ entry, index }: Props) {
  const { updateAddress, removeAddress } = useAppStore()
  const canRemove = useAppStore(selectCanRemove)
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [showDropdown, setShowDropdown] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const fetchSuggestions = useCallback(async (query: string) => {
    if (query.trim().length < 3) {
      setSuggestions([])
      return
    }

    try {
      const url =
        `${GEOCODE_URL}/${encodeURIComponent(query)}.json` +
        `?access_token=${MAPBOX_TOKEN}` +
        `&autocomplete=true&limit=5&types=address,place,poi`

      const res = await fetch(url)
      if (!res.ok) return
      const data = (await res.json()) as { features: Suggestion[] }
      setSuggestions(data.features)
      setShowDropdown(true)
    } catch {
      // Silently fail — user can still type a full address
    }
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    updateAddress(entry.id, val, null)

    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => fetchSuggestions(val), 300)
  }

  const handleSelect = (suggestion: Suggestion) => {
    const [lng, lat] = suggestion.center
    updateAddress(entry.id, suggestion.place_name, { lat, lng })
    setSuggestions([])
    setShowDropdown(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setShowDropdown(false)
    }
  }

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [])

  return (
    <div ref={containerRef} className="flex items-start gap-2">
      <span className="mt-2 flex-shrink-0 w-6 h-6 rounded-full bg-blue-500 text-white text-xs font-bold flex items-center justify-center">
        {index + 1}
      </span>
      <div className="relative flex-1">
        <input
          type="text"
          value={entry.raw}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onFocus={() => suggestions.length > 0 && setShowDropdown(true)}
          placeholder={`Address ${index + 1}`}
          className={`w-full rounded-lg border px-3 py-2 text-sm outline-none transition-colors
            ${entry.geocoded
              ? 'border-green-400 bg-green-50 focus:border-green-500'
              : 'border-gray-300 bg-white focus:border-blue-400'
            }`}
        />
        {entry.geocoded && (
          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-green-500 text-xs">
            ✓
          </span>
        )}

        {showDropdown && suggestions.length > 0 && (
          <ul className="absolute z-50 mt-1 w-full rounded-lg border border-gray-200 bg-white shadow-lg overflow-hidden">
            {suggestions.map((s) => (
              <li key={s.id}>
                <button
                  type="button"
                  onMouseDown={(e) => {
                    // Use mousedown to beat the blur event
                    e.preventDefault()
                    handleSelect(s)
                  }}
                  className="w-full px-3 py-2 text-left text-sm text-gray-800 hover:bg-blue-50 transition-colors truncate"
                >
                  {s.place_name}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {canRemove && (
        <button
          onClick={() => removeAddress(entry.id)}
          className="mt-1.5 flex-shrink-0 text-gray-400 hover:text-red-500 transition-colors text-xl leading-none"
          aria-label="Remove address"
        >
          ×
        </button>
      )}
    </div>
  )
}
