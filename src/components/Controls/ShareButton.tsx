import { useState } from 'react'
import { useAppStore } from '../../store/appStore'
import { buildShareUrl } from '../../hooks/useShareUrl'

export function ShareButton() {
  const addresses = useAppStore((s) => s.addresses)
  const [copied, setCopied] = useState(false)

  const canShare = addresses.some((a) => a.geocoded !== null)

  const handleShare = async () => {
    const url = buildShareUrl(addresses)

    // Update browser URL bar in place
    const params = new URL(url).search
    window.history.replaceState({}, '', params)

    const uaData = (navigator as Navigator & { userAgentData?: { mobile?: boolean } }).userAgentData
    const isMobile = uaData?.mobile ?? /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent)

    if (navigator.share && isMobile) {
      try {
        await navigator.share({ title: 'Middleground', url })
      } catch {
        // User dismissed — not an error worth surfacing
      }
    } else {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <button
      onClick={handleShare}
      disabled={!canShare}
      className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold
        text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed
        transition-colors flex items-center justify-center gap-2"
    >
      {copied ? (
        <>
          <svg className="w-4 h-4 text-green-600" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 00-1.414 0L8 12.586 4.707 9.293a1 1 0 00-1.414 1.414l4 4a1 1 0 001.414 0l8-8a1 1 0 000-1.414z" clipRule="evenodd" />
          </svg>
          <span className="text-green-600">Copied!</span>
        </>
      ) : (
        <>
          <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
            <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
          </svg>
          Share
        </>
      )}
    </button>
  )
}
