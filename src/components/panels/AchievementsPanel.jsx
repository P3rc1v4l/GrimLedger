import { useGameStore } from '../../store/gameStore'
import { ACHIEVEMENTS } from '../../utils/constants'
import { PANEL_STYLE, PanelHeader, Card, ProgressBar, SLabel, C } from '../ui/primitives'

export default function AchievementsPanel() {
  const unlocked      = useGameStore(s => s.achievements.unlocked)
  const totalCollected = useGameStore(s => s.totalCollected)
  const stats         = useGameStore(s => s.stats)

  const totalBonus = unlocked.reduce((sum, id) => {
    const a = ACHIEVEMENTS.find(x => x.id === id)
    return sum + (a?.prodBonus ?? 0)
  }, 0)

  const getProgress = (a) => {
    let cur = 0
    if (a.type in totalCollected)    cur = totalCollected[a.type] ?? 0
    else if (a.type === 'playTime')  cur = stats.playTime ?? 0
    else if (a.type in stats)        cur = stats[a.type] ?? 0
    return Math.min(1, cur / a.goal)
  }

  return (
    <div style={PANEL_STYLE}>
      <PanelHeader
        icon="🏆"
        title="Achievements"
        subtitle={`${unlocked.length}/${ACHIEVEMENTS.length} — Bonus: +${Math.round(totalBonus * 100)}% Produktion`}
      />
      <div className="panel-scroll" style={{ padding: '14px', display: 'flex', flexDirection: 'column', gap: '8px' }}>

        {/* Bonus summary */}
        <div style={{ fontFamily: 'JetBrains Mono', fontSize: '11px', color: C.gold, padding: '8px 12px', background: 'rgba(201,162,39,0.08)', borderRadius: '7px', border: `1px solid ${C.gold}30` }}>
          Aktiver Achievement-Bonus: ×{(1 + totalBonus).toFixed(2)}
        </div>

        {ACHIEVEMENTS.map(a => {
          const done = unlocked.includes(a.id)
          const pct  = getProgress(a)

          return (
            <Card key={a.id} style={{
              border: `1px solid ${done ? '#16653440' : C.borderDim}`,
              opacity: done ? 1 : pct > 0 ? 0.85 : 0.45,
              background: done ? 'rgba(22,101,52,0.06)' : undefined,
            }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                <span style={{ fontSize: '18px', lineHeight: 1, marginTop: '2px' }}>{a.icon}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <span style={{ fontFamily: 'Cinzel', fontSize: '11px', color: done ? C.gold : C.textDim }}>{a.title}</span>
                    {done && <span style={{ fontFamily: 'JetBrains Mono', fontSize: '9px', color: C.green }}>✓</span>}
                  </div>
                  <div style={{ fontFamily: 'EB Garamond', fontSize: '12px', color: C.textSub, fontStyle: 'italic', marginTop: '2px' }}>{a.desc}</div>
                  <div style={{ fontFamily: 'JetBrains Mono', fontSize: '10px', color: done ? C.gold : C.textSub, marginTop: '3px' }}>
                    Bonus: {a.label}
                  </div>
                  {!done && (
                    <div style={{ marginTop: '6px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'JetBrains Mono', fontSize: '9px', color: C.textSub, marginBottom: '3px' }}>
                        <span>Fortschritt</span><span>{Math.round(pct * 100)}%</span>
                      </div>
                      <ProgressBar value={pct * 100} max={100} color="#4a0000" height={3} />
                    </div>
                  )}
                </div>
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
