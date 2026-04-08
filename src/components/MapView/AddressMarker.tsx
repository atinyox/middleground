import { Marker } from 'react-map-gl/mapbox'
import type { LatLng } from '../../types'

interface Props {
  position: LatLng
  label: string
}

export function AddressMarker({ position, label }: Props) {
  return (
    <Marker latitude={position.lat} longitude={position.lng} anchor="center">
      <div
        className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-500 text-white text-xs font-bold shadow-md ring-2 ring-white"
        title={`Address ${label}`}
      >
        {label}
      </div>
    </Marker>
  )
}
