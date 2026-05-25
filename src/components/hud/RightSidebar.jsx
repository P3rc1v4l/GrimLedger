import { useGameStore } from '../../store/gameStore'
import { clsx } from 'clsx'
import { RESOURCES } from '../../utils/constants'
import { fmt, fmtRate } from '../../utils/helpers'
import { calcProductionRates } from '../../systems/production'

const LOG_COLORS = {
  gold:     'border-gold-dark text-gold/80',
  upgrade:  'border-emerald-800 text-emerald-400',
  research: 'border-rune/60 text-rune-light',
  summon:   'border-purple-800 text-purple-400',
  combat:   'border-blood text-blood-light',
  quest:    'border-emerald-700 text-emerald-300',
  prestige: 'border-gold text-gold animate-flicker',
  system:   'border-ash/40 text-ash',
  tip:      'border-rune/40 text-rune-light/80',
  normal:   'border-ash-dark text-ash',
}

export default function RightSidebar() {
  const state = useGameStore((s) => s)
  const { log } = state
  const rates = calcProductionRates(state)

  return (
    <aside className="w-52 flex-shrink-0 flex flex-col border-l border-blood-dark/30 bg-[#07050a]">

      {/* Production rates */}
      <div className="p-3 border-b border-blood-dark/25">
        <div className="sectionLabel mb-2">Produktion / Sek.</div>
        <div className="space-y-0.5">
          {Object.entries(RESOURCES)
            .filter(([k]) => !['abyssMarken'].includes(k))
            .map(([key, def]) => {
              const rate = rates[key] ?? 0
              if (rate < 0.001) return null
              return (
                <div key={key} className={clsx('flex justify-between font-mono text-xs', def.color)}>
                  <span>{def.icon} {def.name}</span>
                  <span className="text-ash">{fmtRate(rate)}</span>
                </div>
              )
            })}
        </div>
      </div>

      {/* Event log */}
      <div className="flex-1 flex flex-col overflow-hidden p-3">
        <div className="sectionLabel mb-2">Chronik</div>
        <div className="flex-1 overflow-y-auto space-y-0.5 pr-0.5">
          {log.map((entry) => (
            <div key={entry.id} className={clsx('logEntry', LOG_COLORS[entry.type] ?? LOG_COLORS.normal)}>
              {entry.msg}
            </div>
          ))}
        </div>
      </div>
    </aside>
  )
}
