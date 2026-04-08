import { Marker } from '@react-google-maps/api'
import type { LatLng } from '../../types'

interface Props {
  position: LatLng
  label: string
}

export function AddressMarker({ position, label }: Props) {
  return (
    <Marker
      position={position}
      label={{ text: label, color: 'white', fontWeight: 'bold', fontSize: '12px' }}
      icon={{
        path: google.maps.SymbolPath.CIRCLE,
        scale: 14,
        fillColor: '#3B82F6',
        fillOpacity: 1,
        strokeColor: 'white',
        strokeWeight: 2,
      }}
    />
  )
}
