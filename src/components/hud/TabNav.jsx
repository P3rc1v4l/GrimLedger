import { useGameStore } from '../../store/gameStore'
import { clsx } from 'clsx'

const TABS = [
  { id: 'tavern',   icon: '🍺', label: 'Taverne'  },
  { id: 'shop',     icon: '⚖️', label: 'Laden'    },
  { id: 'forge',    icon: '⚒️', label: 'Schmiede' },
  { id: 'dungeon',  icon: '⛓️', label: 'Verlies'  },
  { id: 'crypt',    icon: '💀', label: 'Gruft'    },
  { id: 'quests',   icon: '🎯', label: 'Quests'   },
  { id: 'prestige', icon: '✨', label: 'Prestige'  },
  { id: 'log',      icon: '📜', label: 'Chronik'  },
]

export default function TabNav() {
  const { activeTab, setTab, buildings, canPrestige, questsReady } = useGameStore((s) => ({
    activeTab: s.activeTab,
    setTab: s.setTab,
    buildings: s.buildings,
    canPrestige: s.canPrestige,
    questsReady: s.quests.active.some((q) => q.completed && !q.claimed),
  }))

  return (
    <nav className="flex gap-0.5 p-1 bg-stone-900/70 border border-stone-700/30 rounded-xl">
      {TABS.map((tab) => {
        const locked = ['forge','dungeon','crypt'].includes(tab.id) && (buildings[tab.id]?.level ?? 0) === 0
        const prestigeReady = tab.id === 'prestige' && canPrestige()
        const questReady    = tab.id === 'quests' && questsReady
        const active = activeTab === tab.id
        return (
          <button
            key={tab.id}
            onClick={() => setTab(tab.id)}
            className={clsx(
              'flex-1 flex flex-col items-center gap-0.5 py-2 px-0.5 rounded-lg transition-all duration-150',
              active  ? 'bg-amber-900/40 border border-amber-700/40 text-amber-300'
                      : 'text-stone-500 hover:text-stone-300 hover:bg-stone-800/40',
              locked  && 'opacity-40',
              prestigeReady && !active && 'animate-glow border border-violet-700/40',
              questReady    && !active && 'animate-glow border border-amber-600/50',
            )}
          >
            <span className="text-base leading-none">{tab.icon}</span>
            <span className="font-mono text-xs leading-tight truncate w-full text-center">{tab.label}</span>
            {locked && <span className="text-xs leading-none">🔒</span>}
            {prestigeReady && <span className="text-xs leading-none text-violet-400">!</span>}
            {questReady    && <span className="text-xs leading-none text-amber-400">!</span>}
          </button>
        )
      })}
    </nav>
  )
}
