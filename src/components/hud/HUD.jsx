import { useGameStore } from '../../store/gameStore'
import { fmt, fmtPlayTime } from '../../utils/helpers'
import { clsx } from 'clsx'

export default function HUD() {
  const { gold, souls, materials, player, stats, quests, setTab } = useGameStore((s) => ({
    gold: s.gold, souls: s.souls, materials: s.materials,
    player: s.player, stats: s.stats,
    quests: s.quests,
    setTab: s.setTab,
  }))

  const xpPct = Math.min(100, (player.xp / player.xpToNext) * 100)

  const questTotal     = quests.active.length
  const questClaimed   = quests.active.filter((q) => q.claimed).length
  const questClaimable = quests.active.some((q) => q.completed && !q.claimed)

  return (
    <header className="sticky top-0 z-40 bg-stone-950/96 backdrop-blur border-b border-stone-800/50">
      <div className="max-w-2xl mx-auto px-3 py-2 flex items-center gap-3 flex-wrap">

        {/* Brand */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xl">🏰</span>
          <div>
            <h1 className="font-display text-amber-400 text-sm font-bold leading-tight">GrimLedger</h1>
            <div className="font-mono text-xs text-stone-600 leading-tight">{fmtPlayTime(stats.totalPlayTime)}</div>
          </div>
        </div>

        {/* Level + XP */}
        <div className="flex items-center gap-2 bg-stone-900/50 border border-stone-700/20 rounded-lg px-2.5 py-1.5">
          <span className="font-display text-xs text-amber-500 font-bold">Lvl {player.level}</span>
          <div className="w-14 h-1 bg-stone-800 rounded-full overflow-hidden">
            <div className="h-full bg-amber-500 rounded-full transition-all duration-500" style={{ width: `${xpPct}%` }} />
          </div>
          <span className="font-mono text-xs text-stone-600">{fmt(player.xp)}/{fmt(player.xpToNext)}</span>
        </div>

        {/* Quest indicator */}
        <button
          onClick={() => setTab('quests')}
          title="Tagesquests"
          className={clsx(
            'flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 border transition-all duration-200',
            questClaimable
              ? 'bg-amber-900/40 border-amber-600/60 text-amber-300 animate-glow'
              : questClaimed === questTotal
              ? 'bg-stone-900/50 border-stone-700/20 text-stone-600'
              : 'bg-stone-900/50 border-stone-700/20 text-stone-400 hover:text-stone-300'
          )}
        >
          <span className="text-sm leading-none">🎯</span>
          <div>
            <div className="font-mono text-xs font-medium leading-tight">
              {questClaimed}/{questTotal}
            </div>
            <div className="font-mono text-xs leading-tight opacity-70">
              {questClaimable ? 'kassierbar!' : 'Quests'}
            </div>
          </div>
        </button>

        {/* Resources */}
        <div className="flex items-center gap-1.5 ml-auto flex-wrap">
          {[
            { icon: '💰', val: gold,              label: 'Gold'    },
            { icon: '💀', val: souls,             label: 'Seelen'  },
            { icon: '⚙️', val: materials.iron,   label: 'Eisen'   },
            { icon: '🪵', val: materials.wood,   label: 'Holz'    },
            { icon: '🦴', val: materials.bones,  label: 'Knochen' },
            { icon: '🌿', val: materials.herbs,  label: 'Kräuter' },
          ].map(({ icon, val, label }) => (
            <div key={label} className="flex items-center gap-1 bg-stone-900/50 border border-stone-700/20 rounded-lg px-1.5 py-1">
              <span className="text-sm leading-none">{icon}</span>
              <div>
                <div className="font-mono text-xs text-amber-300 font-medium leading-tight">{fmt(val)}</div>
                <div className="font-mono text-xs text-stone-600 leading-tight">{label}</div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </header>
  )
}
