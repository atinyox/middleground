export function ErrorBanner({ message }: { message: string }) {
  return (
    <div className="mx-4 mt-2 rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
      {message}
    </div>
  )
}
