import { useState } from 'react'
import { Marker, InfoWindow } from '@react-google-maps/api'
import type { LatLng } from '../../types'

interface Props {
  id: string
  position: LatLng
  label: string
  canRemove: boolean
  onDragEnd: (id: string, latLng: LatLng) => void
  onRemove: (id: string) => void
}

export function AddressMarker({ id, position, label, canRemove, onDragEnd, onRemove }: Props) {
  const [infoOpen, setInfoOpen] = useState(false)

  return (
    <Marker
      position={position}
      draggable
      label={{ text: label, color: 'white', fontWeight: 'bold', fontSize: '12px' }}
      icon={{
        path: google.maps.SymbolPath.CIRCLE,
        scale: 14,
        fillColor: '#3B82F6',
        fillOpacity: 1,
        strokeColor: 'white',
        strokeWeight: 2,
      }}
      onClick={() => setInfoOpen((o) => !o)}
      onDragEnd={(e) => {
        if (!e.latLng) return
        onDragEnd(id, { lat: e.latLng.lat(), lng: e.latLng.lng() })
      }}
    >
      {infoOpen && (
        <InfoWindow onCloseClick={() => setInfoOpen(false)}>
          <div className="text-sm text-gray-700 flex flex-col gap-1 min-w-[80px]">
            <span className="font-semibold">Pin {label}</span>
            {canRemove && (
              <button
                onClick={() => { setInfoOpen(false); onRemove(id) }}
                className="text-red-500 hover:text-red-700 text-left text-xs"
              >
                Remove
              </button>
            )}
          </div>
        </InfoWindow>
      )}
    </Marker>
  )
}
