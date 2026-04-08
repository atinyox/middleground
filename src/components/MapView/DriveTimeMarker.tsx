import { Marker, Popup } from 'react-map-gl/mapbox'
import { useState } from 'react'
import type { LatLng } from '../../types'

interface Props {
  position: LatLng
}

export function DriveTimeMarker({ position }: Props) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Marker latitude={position.lat} longitude={position.lng} anchor="center">
        <button
          onClick={() => setOpen((v) => !v)}
          title="Drive-time midpoint"
          className="text-amber-500 drop-shadow-md hover:scale-110 transition-transform"
          aria-label="Drive-time midpoint"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2 L22 12 L12 22 L2 12 Z" />
          </svg>
        </button>
      </Marker>

      {open && (
        <Popup
          latitude={position.lat}
          longitude={position.lng}
          anchor="bottom"
          onClose={() => setOpen(false)}
          closeOnClick={false}
          offset={16}
        >
          <span className="text-sm font-medium text-amber-600">Drive-time midpoint</span>
        </Popup>
      )}
    </>
  )
}
