import { useGameStore } from '../../store/gameStore'
import { clsx } from 'clsx'

const NAV_ITEMS = [
  { id: 'dashboard',  icon: '📖', label: 'Ledger'       },
  { id: 'ressourcen', icon: '💀', label: 'Ressourcen'   },
  { id: 'gebaeude',   icon: '🏛️', label: 'Gebäude'      },
  { id: 'forschung',  icon: '📜', label: 'Forschung'    },
  { id: 'beschwoerung',icon:'🔮', label: 'Beschwörung'  },
  { id: 'bosse',      icon: '⚔️', label: 'Bosse'        },
  { id: 'quests',     icon: '🎯', label: 'Quests'       },
  { id: 'aufstieg',   icon: '⬡',  label: 'Aufstieg'     },
  { id: 'einstellungen',icon:'⚙️',label: 'Einstellungen'},
]

export default function NavSidebar() {
  const { activePanel, setPanel, quests, canAscend, stats } = useGameStore((s) => ({
    activePanel: s.activePanel,
    setPanel: s.setPanel,
    quests: s.quests,
    canAscend: s.canAscend,
    stats: s.stats,
  }))

  const questsReady  = quests.daily.some((q) => q.completed && !q.claimed)
    || quests.milestones.some((q) => q.completed && !q.claimed)
  const ascendReady  = canAscend()

  return (
    <nav className="w-44 flex-shrink-0 flex flex-col gap-0.5 py-3 px-2 border-r border-blood-dark/30 bg-[#07050a]">
      {/* Logo */}
      <div className="px-3 pb-3 mb-1 border-b border-blood-dark/25">
        <h1 className="font-display text-gold text-sm font-bold leading-tight tracking-widest animate-flicker">
          GRIM<br />LEDGER
        </h1>
        <div className="font-mono text-xs text-blood-dark mt-1">Aufstieg #{stats.ascensions}</div>
      </div>

      {NAV_ITEMS.map((item) => {
        const active  = activePanel === item.id
        const glowing = (item.id === 'quests' && questsReady) || (item.id === 'aufstieg' && ascendReady)
        return (
          <button
            key={item.id}
            onClick={() => setPanel(item.id)}
            className={clsx(
              active ? 'navItem-active' : 'navItem-inactive',
              glowing && !active && 'animate-bloodPulse border border-blood-dark/50'
            )}
          >
            <span className="text-base leading-none w-5 text-center">{item.icon}</span>
            <span className="font-mono text-xs truncate">{item.label}</span>
            {glowing && !active && (
              <span className="ml-auto text-xs text-blood-light font-mono">!</span>
            )}
          </button>
        )
      })}
    </nav>
  )
}
