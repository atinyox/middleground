export function ApiKeyGate() {
  return (
    <div className="flex h-screen items-center justify-center bg-gray-50">
      <div className="max-w-md rounded-xl border border-amber-200 bg-amber-50 p-8 shadow-sm">
        <h1 className="mb-2 text-xl font-semibold text-amber-800">
          Google Maps API Key Required
        </h1>
        <p className="mb-4 text-sm text-amber-700">
          Create a <code className="font-mono bg-amber-100 px-1 rounded">.env.local</code> file
          in the project root:
        </p>
        <pre className="rounded bg-gray-900 px-4 py-3 text-sm text-green-400">
          VITE_GOOGLE_MAPS_API_KEY=your_key_here
        </pre>
        <p className="mt-4 text-sm text-amber-700">
          Enable these APIs in Google Cloud Console:
        </p>
        <ul className="mt-2 list-disc list-inside text-sm text-amber-700 space-y-1">
          <li>Maps JavaScript API</li>
          <li>Places API</li>
        </ul>
      </div>
    </div>
  )
}
