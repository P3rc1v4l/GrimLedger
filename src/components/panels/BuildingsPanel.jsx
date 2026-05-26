import { useGameStore } from '../../store/gameStore'
import { GrimPanel, PanelHeader, ProgressBar } from '../ui'
import { BUILDINGS, RESOURCES } from '../../utils/constants'
import { canAfford, fmt, fmtCost } from '../../utils/helpers'
import { calcProductionRates } from '../../systems/production'

// Pixel art building icon overlay
function BuildingPixel({ built }) {
  const color = built ? '#4a0000' : '#1a0f1a'
  const pixels = [
    [0,1,1,1,0],
    [1,1,0,1,1],
    [1,0,1,0,1],
    [1,1,1,1,1],
    [0,1,0,1,0],
  ]
  return (
    <svg width={16} height={16} style={{ imageRendering: 'pixelated', position: 'absolute', bottom: 2, right: 2, opacity: 0.5 }}>
      {pixels.flatMap((row, y) => row.map((v, x) =>
        v ? <rect key={`${x}-${y}`} x={x*3} y={y*3} width={3} height={3} fill={color} /> : null
      ))}
    </svg>
  )
}

export default function BuildingsPanel() {
  const state = useGameStore((s) => s)
  const { resources, buildings, buildOrUpgrade } = state
  const rates = calcProductionRates(state)

  return (
    <GrimPanel>
      <PanelHeader icon="🏛️" title="Gebäude" subtitle="Errichte Stätten der Dunkelheit" />
      <div className="grimPanel-body">

        <div style={{ fontFamily: 'EB Garamond', fontSize: '13px', color: '#6b5f6a', fontStyle: 'italic', padding: '8px 10px', background: 'rgba(10,8,10,0.5)', borderRadius: '6px', borderLeft: '2px solid #4a0000', marginBottom: '4px' }}>
          Gebäude produzieren automatisch Ressourcen. Upgrade sie um mehr zu produzieren.
        </div>

        {Object.entries(BUILDINGS).map(([id, def]) => {
          const lvl    = buildings[id]?.level ?? 0
          const isNew  = lvl === 0
          const costs  = isNew ? (def.unlockCost ?? {}) : def.upgradeCost(lvl + 1)
          const canBuy = canAfford(resources, costs)
          const maxed  = lvl >= def.maxLevel
          const prod   = lvl > 0 ? def.produces(lvl) : null
          const prodStr = prod ? Object.entries(prod)
            .map(([k, v]) => `${RESOURCES[k]?.icon ?? k} ${v.toFixed(2)}/s`)
            .join('  ')
            : null

          return (
            <div
              key={id}
              style={{
                background: lvl > 0
                  ? 'linear-gradient(135deg, rgba(30,10,10,0.9) 0%, rgba(20,8,8,0.9) 100%)'
                  : 'rgba(10,8,10,0.6)',
                border: `1px solid ${lvl > 0 ? 'rgba(74,0,0,0.5)' : 'rgba(42,32,40,0.3)'}`,
                borderRadius: '10px',
                padding: '12px',
                opacity: lvl === 0 && !canAfford(resources, def.unlockCost ?? {}) ? 0.5 : 1,
                transition: 'all 0.2s',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {/* Level indicator strip */}
              {lvl > 0 && (
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: '#1a0f1a' }}>
                  <div style={{ height: '100%', width: `${(lvl / def.maxLevel) * 100}%`, background: '#4a0000', transition: 'width 0.5s' }} />
                </div>
              )}

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                {/* Icon */}
                <div style={{
                  fontSize: '28px',
                  lineHeight: 1,
                  width: '44px',
                  height: '44px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: lvl > 0 ? 'rgba(74,0,0,0.2)' : 'rgba(20,15,20,0.5)',
                  borderRadius: '8px',
                  border: `1px solid ${lvl > 0 ? 'rgba(74,0,0,0.4)' : 'rgba(42,32,40,0.3)'}`,
                  flexShrink: 0,
                }}>
                  {def.icon}
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                    <span style={{ fontFamily: 'Cinzel', fontSize: '13px', color: lvl > 0 ? '#c9a227' : '#6b5f6a', fontWeight: 600 }}>
                      {def.name}
                    </span>
                    {lvl > 0 && (
                      <span style={{ fontFamily: 'JetBrains Mono', fontSize: '10px', color: '#4a4048' }}>
                        Stufe {lvl}/{def.maxLevel}
                      </span>
                    )}
                  </div>
                  <div style={{ fontFamily: 'EB Garamond', fontSize: '12px', color: '#4a4048', fontStyle: 'italic', margin: '2px 0' }}>
                    {def.desc}
                  </div>
                  {prodStr && (
                    <div style={{ fontFamily: 'JetBrains Mono', fontSize: '11px', color: '#8b0000', marginTop: '3px' }}>
                      ▶ {prodStr}
                    </div>
                  )}
                  {!maxed && (
                    <div style={{ fontFamily: 'JetBrains Mono', fontSize: '10px', color: canBuy ? '#c9a227' : '#4a4048', marginTop: '3px' }}>
                      Kosten: {fmtCost(costs)}
                    </div>
                  )}
                </div>

                {/* Action button */}
                <div style={{ flexShrink: 0 }}>
                  {maxed ? (
                    <div style={{ fontFamily: 'JetBrains Mono', fontSize: '10px', color: '#c9a227', padding: '8px', textAlign: 'center' }}>
                      MAX ✓
                    </div>
                  ) : (
                    <button
                      onClick={() => buildOrUpgrade(id)}
                      disabled={!canBuy}
                      style={{
                        fontFamily: 'JetBrains Mono',
                        fontSize: '12px',
                        fontWeight: 500,
                        padding: '8px 14px',
                        borderRadius: '6px',
                        border: canBuy ? '1px solid #8a6c1a' : '1px solid #2a2028',
                        background: canBuy ? 'rgba(138,108,26,0.3)' : 'rgba(20,15,20,0.5)',
                        color: canBuy ? '#c9a227' : '#2a2028',
                        cursor: canBuy ? 'pointer' : 'not-allowed',
                        transition: 'all 0.15s',
                        whiteSpace: 'nowrap',
                      }}
                      onMouseEnter={(e) => { if (canBuy) { e.target.style.background = 'rgba(201,162,39,0.3)'; e.target.style.color = '#e8c84a'; e.target.style.boxShadow = '0 0 12px rgba(201,162,39,0.2)' } }}
                      onMouseLeave={(e) => { e.target.style.background = canBuy ? 'rgba(138,108,26,0.3)' : 'rgba(20,15,20,0.5)'; e.target.style.color = canBuy ? '#c9a227' : '#2a2028'; e.target.style.boxShadow = 'none' }}
                    >
                      {isNew ? '🏗️ Bauen' : '⬆️ Upgrade'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </GrimPanel>
  )
}
