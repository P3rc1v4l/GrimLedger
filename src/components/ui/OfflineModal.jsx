import { useGameStore } from '../../store/gameStore'
import { RESOURCES } from '../../utils/constants'
import { fmt, fmtTime } from '../../utils/helpers'

export default function OfflineModal() {
  const { offlineResult, dismissOfflineResult } = useGameStore((s) => ({
    offlineResult: s.offlineResult,
    dismissOfflineResult: s.dismissOfflineResult,
  }))

  if (!offlineResult) return null

  const { gained, seconds, cappedAt } = offlineResult
  const entries = Object.entries(gained).filter(([, v]) => v >= 0.01)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <div className="grimPanel border-gold-dark/50 w-full max-w-sm mx-4 animate-fadeIn">
        <div className="grimPanel-header">
          <span className="text-xl animate-flicker">😴</span>
          <div>
            <h2 className="font-display text-sm text-gold tracking-wider">Offline-Fortschritt</h2>
            <div className="font-mono text-xs text-ash">{fmtTime(seconds * 1000)} abwesend</div>
          </div>
        </div>
        <div className="p-4 space-y-3">
          {cappedAt && (
            <p className="font-mono text-xs text-blood-light">
              ⚠️ Auf max. Offline-Zeit begrenzt. Erforsche "Endlose Buchführung" für mehr.
            </p>
          )}
          <div className="space-y-1">
            {entries.map(([key, amount]) => {
              const def = RESOURCES[key]
              if (!def) return null
              return (
                <div key={key} className={`flex justify-between font-mono text-xs ${def.color}`}>
                  <span>{def.icon} {def.name}</span>
                  <span>+{fmt(amount)}</span>
                </div>
              )
            })}
          </div>
          <button onClick={dismissOfflineResult} className="btn-gold w-full justify-center">
            Weiter spielen
          </button>
        </div>
      </div>
    </div>
  )
}
