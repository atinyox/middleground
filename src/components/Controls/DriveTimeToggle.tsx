import { useEffect } from 'react'
import { useAppStore } from '../../store/appStore'
import { useDriveTimeMidpoint } from '../../hooks/useDriveTimeMidpoint'
import { haversineDistance, formatDistance } from '../../utils/geo'
import { Spinner } from '../common/Spinner'

export function DriveTimeToggle() {
  const { driveTimeEnabled, setDriveTimeEnabled, searchState } = useAppStore()
  const { compute } = useDriveTimeMidpoint()

  const isDone = searchState.status === 'done'
  const isComputing = searchState.status === 'computing' || searchState.status === 'searching'

  // Trigger drive-time compute when toggled on and geo results exist
  useEffect(() => {
    if (driveTimeEnabled && isDone && searchState.geographicMidpoint) {
      compute()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [driveTimeEnabled, isDone])

  const diffMeters =
    searchState.geographicMidpoint && searchState.driveTimeMidpoint
      ? haversineDistance(searchState.geographicMidpoint, searchState.driveTimeMidpoint)
      : null

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
          Drive-time midpoint
          <span className="text-xs text-gray-400 font-normal">(beta)</span>
        </label>
        <button
          role="switch"
          aria-checked={driveTimeEnabled}
          onClick={() => setDriveTimeEnabled(!driveTimeEnabled)}
          className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors
            ${driveTimeEnabled ? 'bg-blue-600' : 'bg-gray-300'}`}
        >
          <span
            className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform
              ${driveTimeEnabled ? 'translate-x-4.5' : 'translate-x-1'}`}
          />
        </button>
      </div>

      {driveTimeEnabled && (
        <div className="text-xs text-gray-500">
          {isComputing && (
            <span className="flex items-center gap-1.5 text-blue-600">
              <Spinner size="sm" /> Computing drive times…
            </span>
          )}
          {isDone && diffMeters !== null && (
            <span className="text-amber-600">
              Differs from geographic center by {formatDistance(diffMeters)}
            </span>
          )}
          {isDone && searchState.driveTimeMidpoint === undefined && !isComputing && (
            <span className="text-gray-400">
              Drive-time midpoint matches geographic center
            </span>
          )}
        </div>
      )}
    </div>
  )
}
