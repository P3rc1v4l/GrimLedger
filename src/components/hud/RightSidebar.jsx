import { useGameStore } from '../../store/gameStore'
import { RESOURCES } from '../../utils/constants'
import { fmt, fmtRate } from '../../utils/helpers'
import { calcProductionRates } from '../../systems/production'

const LOG_COLORS = {
  gold:     '#c9a227',
  upgrade:  '#4ade80',
  research: '#9333ea',
  summon:   '#a855f7',
  combat:   '#ef4444',
  quest:    '#4ade80',
  prestige: '#c9a227',
  system:   '#4a4048',
  tip:      '#6b21a8',
  normal:   '#2a2028',
}

export default function RightSidebar() {
  const state = useGameStore((s) => s)
  const { log } = state
  const rates = calcProductionRates(state)

  const activeRates = Object.entries(RESOURCES)
    .filter(([k]) => k !== 'abyssMarken' && (rates[k] ?? 0) > 0.001)

  return (
    <aside style={{
      width: '180px',
      flexShrink: 0,
      display: 'flex',
      flexDirection: 'column',
      borderLeft: '1px solid rgba(74,0,0,0.25)',
      background: '#0f0a17',
    }}>
      {/* Production rates */}
      <div style={{ padding: '12px', borderBottom: '1px solid rgba(74,0,0,0.2)', flexShrink: 0 }}>
        <div style={{ fontFamily: 'JetBrains Mono', fontSize: '9px', color: 'rgba(74,0,0,0.7)', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '8px' }}>
          Produktion / Sek.
        </div>
        {activeRates.length === 0 ? (
          <div style={{ fontFamily: 'JetBrains Mono', fontSize: '10px', color: '#2a2028', fontStyle: 'italic' }}>
            Noch keine Produktion
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {activeRates.map(([key, def]) => (
              <div key={key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontFamily: 'JetBrains Mono', fontSize: '10px', color: '#6b5f6a' }}>
                  {def.icon} {def.name}
                </span>
                <span style={{ fontFamily: 'JetBrains Mono', fontSize: '10px', color: '#4a4048' }}>
                  {(rates[key]).toFixed(2)}/s
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Log */}
      <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', padding: '12px' }}>
        <div style={{ fontFamily: 'JetBrains Mono', fontSize: '9px', color: 'rgba(74,0,0,0.7)', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '8px', flexShrink: 0 }}>
          Chronik
        </div>
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '2px' }}>
          {log.map((entry) => (
            <div
              key={entry.id}
              style={{
                fontFamily: 'JetBrains Mono',
                fontSize: '10px',
                borderLeft: `2px solid ${LOG_COLORS[entry.type] ?? LOG_COLORS.normal}`,
                paddingLeft: '6px',
                paddingTop: '2px',
                paddingBottom: '2px',
                lineHeight: 1.4,
                color: LOG_COLORS[entry.type] ?? LOG_COLORS.normal,
                opacity: 0.85,
              }}
            >
              {entry.msg}
            </div>
          ))}
        </div>
      </div>
    </aside>
  )
}
