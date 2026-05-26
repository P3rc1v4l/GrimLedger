import { useGameStore } from '../../store/gameStore'
import { BUILDINGS, RES } from '../../utils/constants'
import { canAfford, fmt } from '../../utils/helpers'
import { PANEL_STYLE, PanelHeader, ProgressBar, C } from '../ui/primitives'

export default function BuildingsPanel() {
  const resources     = useGameStore(s => s.resources)
  const buildings     = useGameStore(s => s.buildings)
  const buildOrUpgrade = useGameStore(s => s.buildOrUpgrade)

  return (
    <div style={PANEL_STYLE}>
      <PanelHeader icon="🏛️" title="Gebäude" subtitle="Errichte Stätten der Dunkelheit" />
      <div className="panel-scroll" style={{ padding: '14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div style={{ fontFamily: 'EB Garamond', fontSize: '13px', color: C.textDim, fontStyle: 'italic', padding: '8px 10px', background: 'rgba(74,0,0,0.1)', borderRadius: '6px', borderLeft: '2px solid #4a0000' }}>
          Gebäude produzieren automatisch Ressourcen — auch offline.
        </div>

        {Object.entries(BUILDINGS).map(([id, def]) => {
          const lvl    = buildings[id]?.level ?? 0
          const isNew  = lvl === 0
          const maxed  = lvl >= def.maxLevel
          const cost   = isNew ? def.unlockCost : def.upgradeCost(lvl + 1)
          const canBuy = canAfford(resources, cost)
          const prod   = lvl > 0 ? def.produces(lvl) : null

          const prodStr = prod
            ? Object.entries(prod).map(([k, v]) => `${RES[k]?.icon ?? k} ${v.toFixed(3)}/s`).join('  ')
            : null

          const costStr = !maxed && cost
            ? Object.entries(cost).map(([k, v]) => `${fmt(v)} ${RES[k]?.icon ?? k}`).join(' · ')
            : null

          return (
            <div key={id} style={{
              background: lvl > 0 ? 'linear-gradient(135deg, rgba(30,15,40,0.9) 0%, rgba(22,10,30,0.9) 100%)' : 'rgba(15,10,20,0.6)',
              border: `1px solid ${lvl > 0 ? 'rgba(74,0,0,0.5)' : C.borderDim}`,
              borderRadius: '10px', padding: '12px',
              opacity: isNew && !canAfford(resources, def.unlockCost) ? 0.5 : 1,
              transition: 'opacity 0.2s',
              position: 'relative', overflow: 'hidden',
            }}>
              {lvl > 0 && (
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: '#1a0f1a' }}>
                  <div style={{ height: '100%', width: `${(lvl / def.maxLevel) * 100}%`, background: '#4a0000', transition: 'width 0.5s' }} />
                </div>
              )}

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginTop: lvl > 0 ? '4px' : 0 }}>
                <div style={{ fontSize: '26px', lineHeight: 1, width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: lvl > 0 ? 'rgba(74,0,0,0.2)' : 'rgba(20,15,25,0.5)', borderRadius: '8px', border: `1px solid ${lvl > 0 ? 'rgba(74,0,0,0.4)' : C.borderDim}`, flexShrink: 0 }}>
                  {def.icon}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '2px' }}>
                    <span style={{ fontFamily: 'Cinzel', fontSize: '13px', color: lvl > 0 ? C.gold : C.textDim, fontWeight: 600 }}>{def.name}</span>
                    {lvl > 0 && <span style={{ fontFamily: 'JetBrains Mono', fontSize: '10px', color: C.textSub }}>Lvl {lvl}/{def.maxLevel}</span>}
                  </div>
                  <div style={{ fontFamily: 'EB Garamond', fontSize: '12px', color: C.textSub, fontStyle: 'italic', marginBottom: prodStr ? '3px' : 0 }}>{def.desc}</div>
                  {prodStr && <div style={{ fontFamily: 'JetBrains Mono', fontSize: '10px', color: '#8b0000', marginBottom: '3px' }}>▶ {prodStr}</div>}
                  {costStr && <div style={{ fontFamily: 'JetBrains Mono', fontSize: '10px', color: canBuy ? C.gold : C.textSub }}>Kosten: {costStr}</div>}
                </div>

                <div style={{ flexShrink: 0 }}>
                  {maxed ? (
                    <span style={{ fontFamily: 'JetBrains Mono', fontSize: '10px', color: C.gold }}>MAX ✓</span>
                  ) : (
                    <button
                      onClick={() => buildOrUpgrade(id)}
                      disabled={!canBuy}
                      style={{
                        fontFamily: 'JetBrains Mono', fontSize: '11px', fontWeight: 500,
                        padding: '7px 12px', borderRadius: '6px', whiteSpace: 'nowrap',
                        border: canBuy ? `1px solid ${C.gold}55` : `1px solid ${C.borderDim}`,
                        background: canBuy ? `rgba(201,162,39,0.2)` : 'rgba(20,15,25,0.5)',
                        color: canBuy ? C.gold : C.textSub,
                        cursor: canBuy ? 'pointer' : 'not-allowed',
                        opacity: canBuy ? 1 : 0.5,
                        transition: 'all 0.13s',
                      }}
                      onMouseEnter={e => { if (canBuy) { e.currentTarget.style.background = 'rgba(201,162,39,0.3)'; e.currentTarget.style.boxShadow = '0 0 10px rgba(201,162,39,0.2)' } }}
                      onMouseLeave={e => { if (canBuy) { e.currentTarget.style.background = 'rgba(201,162,39,0.2)'; e.currentTarget.style.boxShadow = 'none' } }}
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
    </div>
  )
}
