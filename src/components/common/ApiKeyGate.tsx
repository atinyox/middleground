export function ApiKeyGate() {
  return (
    <div className="flex h-screen items-center justify-center bg-gray-50">
      <div className="max-w-md rounded-xl border border-amber-200 bg-amber-50 p-8 shadow-sm">
        <h1 className="mb-2 text-xl font-semibold text-amber-800">
          Mapbox Token Required
        </h1>
        <p className="mb-4 text-sm text-amber-700">
          Create a <code className="font-mono bg-amber-100 px-1 rounded">.env.local</code> file
          in the project root:
        </p>
        <pre className="rounded bg-gray-900 px-4 py-3 text-sm text-green-400">
          VITE_MAPBOX_TOKEN=your_token_here
        </pre>
        <p className="mt-4 text-sm text-amber-700">
          Get a free token at <span className="font-mono text-xs">mapbox.com</span> — one token covers the map, address search, restaurant discovery, and drive-time routing.
        </p>
      </div>
    </div>
  )
}
