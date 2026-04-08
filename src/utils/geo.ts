import type { LatLng } from '../types'

/**
 * Compute the geographic midpoint using ECEF (3D Cartesian) averaging.
 * Simple lat/lng averaging fails near the antimeridian (±180°).
 */
export function computeGeographicMidpoint(points: LatLng[]): LatLng {
  if (points.length === 1) return points[0]

  let x = 0, y = 0, z = 0

  for (const p of points) {
    const latRad = (p.lat * Math.PI) / 180
    const lngRad = (p.lng * Math.PI) / 180
    x += Math.cos(latRad) * Math.cos(lngRad)
    y += Math.cos(latRad) * Math.sin(lngRad)
    z += Math.sin(latRad)
  }

  x /= points.length
  y /= points.length
  z /= points.length

  const lngRad = Math.atan2(y, x)
  const hypot = Math.sqrt(x * x + y * y)
  const latRad = Math.atan2(z, hypot)

  return {
    lat: (latRad * 180) / Math.PI,
    lng: (lngRad * 180) / Math.PI,
  }
}

/**
 * Haversine great-circle distance in meters.
 */
export function haversineDistance(a: LatLng, b: LatLng): number {
  const R = 6371000 // Earth radius in meters
  const φ1 = (a.lat * Math.PI) / 180
  const φ2 = (b.lat * Math.PI) / 180
  const Δφ = ((b.lat - a.lat) * Math.PI) / 180
  const Δλ = ((b.lng - a.lng) * Math.PI) / 180

  const sinHalf = Math.sin(Δφ / 2)
  const sinHalfLng = Math.sin(Δλ / 2)
  const aVal =
    sinHalf * sinHalf +
    Math.cos(φ1) * Math.cos(φ2) * sinHalfLng * sinHalfLng

  return R * 2 * Math.atan2(Math.sqrt(aVal), Math.sqrt(1 - aVal))
}

/**
 * Format a distance in meters to a human-readable string.
 */
export function formatDistance(meters: number): string {
  if (meters < 1000) return `${Math.round(meters)} m`
  return `${(meters / 1000).toFixed(1)} km`
}
