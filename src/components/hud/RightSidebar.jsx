import { useGameStore } from '../../store/gameStore'
import { RES } from '../../utils/constants'
import { calcRates } from '../../systems/production'
import { fmtRate } from '../../utils/helpers'
import { C } from '../ui/primitives'

const LOG_COLOR = {
  gold: '#c9a227', upgrade: '#4ade80', research: '#c084fc', summon: '#a855f7',
  combat: '#ef4444', quest: '#4ade80', prestige: '#e8c84a', achievement: '#f59e0b',
  event: '#a78bfa', system: C.textSub, tip: '#60a5fa', normal: C.textSub,
}

export default function RightSidebar() {
  const state    = useGameStore(s => s)
  const { log, settings } = state
  const rates    = calcRates(state)
  const showRates = settings.showRates !== false

  const activeRates = Object.entries(rates)
    .filter(([k, v]) => v >= 0.001 && RES[k] && k !== 'abyssMarken')

  return (
    <aside style={{
      width: '172px', flexShrink: 0, display: 'flex', flexDirection: 'column',
      borderLeft: `1px solid ${C.borderDim}`, background: '#0f0a17',
    }}>
      {showRates && activeRates.length > 0 && (
        <div style={{ padding: '10px 12px', borderBottom: `1px solid ${C.borderDim}`, flexShrink: 0 }}>
          <div style={{ fontFamily: 'JetBrains Mono', fontSize: '9px', color: '#4a0000', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '8px' }}>Produktion /s</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
            {activeRates.map(([k, rate]) => {
              const r = RES[k]
              return (
                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'JetBrains Mono', fontSize: '10px' }}>
                  <span style={{ color: C.textDim }}>{r.icon} {r.name}</span>
                  <span style={{ color: r.hex }}>{fmtRate(rate)}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: '10px 12px' }}>
        <div style={{ fontFamily: 'JetBrains Mono', fontSize: '9px', color: '#4a0000', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '8px', flexShrink: 0 }}>Chronik</div>
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '2px' }}>
          {log.map(e => (
            <div key={e.id} style={{
              fontFamily: 'JetBrains Mono', fontSize: '10px',
              color: LOG_COLOR[e.type] ?? C.textSub,
              borderLeft: `2px solid ${LOG_COLOR[e.type] ?? C.textSub}`,
              paddingLeft: '6px', paddingTop: '1px', paddingBottom: '1px',
              lineHeight: 1.45, opacity: 0.9,
            }}>
              {e.msg}
            </div>
          ))}
        </div>
      </div>
    </aside>
  )
}
