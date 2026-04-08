import { useEffect } from 'react'
import { useAppStore } from '../store/appStore'
import type { AddressEntry } from '../types'

/**
 * Builds a shareable URL encoding all geocoded addresses as `a` params.
 * Format: ?a=raw|lat|lng|placeId  (placeId segment omitted if absent)
 */
export function buildShareUrl(addresses: AddressEntry[]): string {
  const params = new URLSearchParams()
  for (const addr of addresses) {
    if (!addr.geocoded) continue
    const { lat, lng } = addr.geocoded
    const parts = [
      addr.raw,
      lat.toFixed(5),
      lng.toFixed(5),
    ]
    if (addr.placeId) parts.push(addr.placeId)
    params.append('a', parts.join('|'))
  }
  return `${window.location.origin}${window.location.pathname}?${params.toString()}`
}

/**
 * On mount, reads `a` params from the URL, hydrates the store, then cleans the URL.
 * Must be called inside a component that has access to the Zustand store.
 */
export function useHydrateFromUrl(): void {
  const hydrateAddresses = useAppStore((s) => s.hydrateAddresses)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const entries = params.getAll('a')
    if (entries.length === 0) return

    const parsed = entries.flatMap((raw) => {
      const parts = raw.split('|')
      if (parts.length < 3) return []
      const [rawText, latStr, lngStr, placeId] = parts
      const lat = parseFloat(latStr)
      const lng = parseFloat(lngStr)
      if (isNaN(lat) || isNaN(lng)) return []
      return [{ raw: rawText, geocoded: { lat, lng }, placeId }]
    })

    if (parsed.length === 0) return

    hydrateAddresses(parsed)
    window.history.replaceState({}, '', window.location.pathname)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps
}
