import { useAppStore, selectCanAdd } from '../../store/appStore'
import { AddressInput } from './AddressInput'

export function AddressPanel() {
  const { addresses, addAddress } = useAppStore()
  const canAdd = useAppStore(selectCanAdd)

  return (
    <div className="px-4 pt-4">
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">
        Addresses
      </h2>
      <div className="space-y-2">
        {addresses.map((entry, i) => (
          <AddressInput key={entry.id} entry={entry} index={i} />
        ))}
      </div>
      {canAdd && (
        <button
          onClick={addAddress}
          className="mt-3 flex items-center gap-1.5 text-sm text-blue-500 hover:text-blue-700 transition-colors"
        >
          <span className="text-lg leading-none">+</span>
          Add another address
        </button>
      )}
    </div>
  )
}
