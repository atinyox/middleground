import { Marker, InfoWindow } from '@react-google-maps/api'
import { useState } from 'react'
import type { LatLng } from '../../types'

interface Props {
  position: LatLng
}

export function MidpointMarker({ position }: Props) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Marker
        position={position}
        onClick={() => setOpen((v) => !v)}
        icon={{
          path: 'M 0,-1 1,0 0,1 -1,0 Z',
          scale: 12,
          fillColor: '#8B5CF6',
          fillOpacity: 1,
          strokeColor: 'white',
          strokeWeight: 2,
        }}
        title="Midpoint"
      />
      {open && (
        <InfoWindow position={position} onCloseClick={() => setOpen(false)}>
          <span className="text-sm font-medium text-purple-700">Midpoint</span>
        </InfoWindow>
      )}
    </>
  )
}
