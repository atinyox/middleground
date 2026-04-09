import { useEffect, useRef } from 'react'
import { useAppStore, selectCanRemove } from '../../store/appStore'
import type { AddressEntry } from '../../types'

interface Props {
  entry: AddressEntry
  index: number
  isLoaded: boolean
}

export function AddressInput({ entry, index, isLoaded }: Props) {
  const { updateAddress, removeAddress, setDraggingPinId } = useAppStore()
  const canRemove = useAppStore(selectCanRemove)
  const inputRef = useRef<HTMLInputElement>(null)
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null)

  useEffect(() => {
    if (!isLoaded || !inputRef.current || autocompleteRef.current) return

    const ac = new google.maps.places.Autocomplete(inputRef.current, {
      fields: ['geometry', 'formatted_address', 'place_id'],
    })

    ac.addListener('place_changed', () => {
      const place = ac.getPlace()
      if (!place.geometry?.location) return
      updateAddress(
        entry.id,
        place.formatted_address ?? inputRef.current?.value ?? '',
        { lat: place.geometry.location.lat(), lng: place.geometry.location.lng() },
        place.place_id
      )
    })

    autocompleteRef.current = ac

    return () => {
      if (autocompleteRef.current) {
        google.maps.event.clearInstanceListeners(autocompleteRef.current)
        autocompleteRef.current = null
      }
    }
  }, [isLoaded, entry.id, updateAddress])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateAddress(entry.id, e.target.value, null)
  }

  return (
    <div className="flex items-center gap-2">
      <span
        className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-500 text-white text-xs font-bold flex items-center justify-center cursor-grab active:cursor-grabbing select-none"
        draggable
        title="Drag onto map to place pin"
        onDragStart={(e) => {
          const ghost = document.createElement('canvas')
          ghost.width = 1
          ghost.height = 1
          e.dataTransfer.setDragImage(ghost, 0, 0)
          e.dataTransfer.setData('addressId', entry.id)
          e.dataTransfer.effectAllowed = 'move'
          setDraggingPinId(entry.id)
        }}
        onDragEnd={() => setDraggingPinId(null)}
      >
        {index + 1}
      </span>
      <div className="relative flex-1">
        <input
          ref={inputRef}
          type="text"
          value={entry.raw}
          onChange={handleChange}
          placeholder={`Address ${index + 1}`}
          className={`w-full rounded-lg border px-3 py-2 text-sm outline-none transition-colors
            ${entry.geocoded
              ? 'border-green-400 bg-green-50 focus:border-green-500'
              : 'border-gray-300 bg-white focus:border-blue-400'
            }`}
        />
        {entry.geocoded && (
          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-green-500 text-xs">✓</span>
        )}
      </div>
      {canRemove && (
        <button
          onClick={() => removeAddress(entry.id)}
          className="flex-shrink-0 text-gray-400 hover:text-red-500 transition-colors text-xl leading-none"
          aria-label="Remove address"
        >
          ×
        </button>
      )}
    </div>
  )
}
