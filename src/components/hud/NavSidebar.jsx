import { useGameStore } from '../../store/gameStore'

const NAV_ITEMS = [
  { id: 'dashboard',    icon: '📖', label: 'Ledger'       },
  { id: 'ressourcen',   icon: '💀', label: 'Ressourcen'   },
  { id: 'gebaeude',     icon: '🏛️', label: 'Gebäude'      },
  { id: 'forschung',    icon: '📜', label: 'Forschung'    },
  { id: 'beschwoerung', icon: '🔮', label: 'Beschwörung'  },
  { id: 'bosse',        icon: '⚔️', label: 'Bosse'        },
  { id: 'quests',       icon: '🎯', label: 'Quests'       },
  { id: 'achievements', icon: '🏆', label: 'Achievements'  },
  { id: 'aufstieg',     icon: '⬡',  label: 'Aufstieg'     },
  { id: 'einstellungen',icon: '⚙️', label: 'Einstellungen'},
]

export default function NavSidebar() {
  const { activePanel, setPanel, quests, canAscend, stats } = useGameStore((s) => ({
    activePanel: s.activePanel,
    setPanel: s.setPanel,
    quests: s.quests,
    canAscend: s.canAscend,
    stats: s.stats,
  }))

  const questsReady = (quests.daily || []).some((q) => q.completed && !q.claimed)
    || (quests.milestones || []).some((q) => q.completed && !q.claimed)
  const ascendReady = canAscend()

  return (
    <nav style={{
      width: '152px',
      flexShrink: 0,
      display: 'flex',
      flexDirection: 'column',
      gap: '2px',
      padding: '12px 8px',
      borderRight: '1px solid rgba(74,0,0,0.25)',
      background: '#07050a',
      overflowY: 'auto',
    }}>
      {/* Logo */}
      <div style={{ padding: '4px 8px 12px', borderBottom: '1px solid rgba(74,0,0,0.2)', marginBottom: '6px' }}>
        <div style={{ fontFamily: 'Cinzel Decorative, Cinzel, serif', fontSize: '13px', color: '#c9a227', fontWeight: 700, lineHeight: 1.2, letterSpacing: '0.05em' }}>
          GRIM
        </div>
        <div style={{ fontFamily: 'Cinzel Decorative, Cinzel, serif', fontSize: '13px', color: '#8b0000', fontWeight: 700, lineHeight: 1.2, letterSpacing: '0.1em' }}>
          LEDGER
        </div>
        <div style={{ fontFamily: 'JetBrains Mono', fontSize: '9px', color: '#2a2028', marginTop: '4px' }}>
          Aufstieg #{stats.ascensions}
        </div>
      </div>

      {NAV_ITEMS.map((item) => {
        const active   = activePanel === item.id
        const glowing  = (item.id === 'quests' && questsReady) || (item.id === 'aufstieg' && ascendReady)

        return (
          <button
            key={item.id}
            onClick={() => setPanel(item.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 10px',
              borderRadius: '6px',
              cursor: 'pointer',
              border: active
                ? '1px solid rgba(74,0,0,0.6)'
                : glowing
                ? '1px solid rgba(139,0,0,0.4)'
                : '1px solid transparent',
              background: active
                ? 'rgba(139,0,0,0.15)'
                : glowing
                ? 'rgba(74,0,0,0.1)'
                : 'transparent',
              color: active ? '#ff6b6b' : glowing ? '#ff4444' : '#4a4048',
              transition: 'all 0.15s',
              width: '100%',
              textAlign: 'left',
              position: 'relative',
            }}
            onMouseEnter={(e) => { if (!active) { e.currentTarget.style.background = 'rgba(26,15,26,0.6)'; e.currentTarget.style.color = '#c8b89a' } }}
            onMouseLeave={(e) => { if (!active) { e.currentTarget.style.background = glowing ? 'rgba(74,0,0,0.1)' : 'transparent'; e.currentTarget.style.color = glowing ? '#ff4444' : '#4a4048' } }}
          >
            <span style={{ fontSize: '15px', lineHeight: 1, width: '20px', textAlign: 'center' }}>{item.icon}</span>
            <span style={{ fontFamily: 'JetBrains Mono', fontSize: '11px', flex: 1 }}>{item.label}</span>
            {glowing && (
              <span style={{ fontFamily: 'JetBrains Mono', fontSize: '10px', color: '#ff4444', fontWeight: 700 }}>!</span>
            )}
          </button>
        )
      })}
    </nav>
  )
}
