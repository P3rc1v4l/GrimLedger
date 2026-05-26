import { useGameStore } from '../../store/gameStore'
import { C } from '../ui/primitives'

const NAV = [
  { id: 'dashboard',    icon: '📖', label: 'Ledger'      },
  { id: 'ressourcen',   icon: '💀', label: 'Ressourcen'  },
  { id: 'gebaeude',     icon: '🏛️', label: 'Gebäude'     },
  { id: 'forschung',    icon: '📜', label: 'Forschung'   },
  { id: 'beschwoerung', icon: '🔮', label: 'Beschwörung' },
  { id: 'bosse',        icon: '⚔️', label: 'Bosse'       },
  { id: 'quests',       icon: '🎯', label: 'Quests'      },
  { id: 'achievements', icon: '🏆', label: 'Achievements'},
  { id: 'aufstieg',     icon: '⬡',  label: 'Aufstieg'   },
  { id: 'einstellungen',icon: '⚙️', label: 'Einstellung.'},
]

export default function NavSidebar() {
  const activePanel = useGameStore(s => s.activePanel)
  const setPanel    = useGameStore(s => s.setPanel)
  const quests      = useGameStore(s => s.quests)
  const canAscend   = useGameStore(s => s.canAscend)
  const ascensions  = useGameStore(s => s.stats.ascensions)

  const questAlert  = [...(quests.daily ?? []), ...(quests.milestones ?? [])].some(q => q.completed && !q.claimed)
  const ascendAlert = canAscend()

  return (
    <nav style={{
      width: '146px', flexShrink: 0, display: 'flex', flexDirection: 'column',
      gap: '1px', padding: '10px 6px', borderRight: `1px solid ${C.borderDim}`,
      background: '#0f0a17', overflowY: 'auto',
    }}>
      <div style={{ padding: '4px 6px 12px', marginBottom: '4px', borderBottom: `1px solid ${C.borderDim}` }}>
        <div className="anim-flicker" style={{ fontFamily: 'Cinzel', fontSize: '14px', color: C.gold, fontWeight: 700, lineHeight: 1.1 }}>GRIM</div>
        <div style={{ fontFamily: 'Cinzel', fontSize: '14px', color: '#8b0000', fontWeight: 700, lineHeight: 1.1 }}>LEDGER</div>
        <div style={{ fontFamily: 'JetBrains Mono', fontSize: '9px', color: C.textSub, marginTop: '4px' }}>Aufstieg #{ascensions}</div>
      </div>

      {NAV.map(item => {
        const active = activePanel === item.id
        const alert  = (item.id === 'quests' && questAlert) || (item.id === 'aufstieg' && ascendAlert)
        return (
          <button key={item.id} onClick={() => setPanel(item.id)}
            style={{
              display: 'flex', alignItems: 'center', gap: '7px',
              padding: '7px 8px', borderRadius: '6px', width: '100%', textAlign: 'left',
              cursor: 'pointer',
              border: active ? '1px solid rgba(74,0,0,0.5)' : '1px solid transparent',
              background: active ? 'rgba(139,0,0,0.15)' : 'transparent',
              color: active ? '#ef4444' : alert ? '#ffab5e' : C.textDim,
              transition: 'all 0.12s',
            }}
            onMouseEnter={e => { if (!active) { e.currentTarget.style.background = 'rgba(30,20,40,0.9)'; e.currentTarget.style.color = C.text } }}
            onMouseLeave={e => { if (!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = alert ? '#ffab5e' : C.textDim } }}
          >
            <span style={{ fontSize: '14px', width: '18px', textAlign: 'center', flexShrink: 0 }}>{item.icon}</span>
            <span style={{ fontFamily: 'JetBrains Mono', fontSize: '10px', flex: 1, lineHeight: 1.2 }}>{item.label}</span>
            {alert && !active && <span style={{ color: C.gold, fontSize: '10px', fontWeight: 700 }}>!</span>}
          </button>
        )
      })}
    </nav>
  )
}
