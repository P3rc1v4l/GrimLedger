import { useGameStore } from '../../store/gameStore'
import { GrimPanel, PanelHeader, GrimDivider } from '../ui'
import { ACHIEVEMENTS, calcAchievementBonus } from '../../systems/achievements'
import { fmt } from '../../utils/helpers'
import { clsx } from 'clsx'

export default function AchievementsPanel() {
  const { achievements, stats, totalCollected } = useGameStore((s) => ({
    achievements: s.achievements,
    stats: s.stats,
    totalCollected: s.totalCollected,
  }))

  const unlocked = achievements?.unlocked ?? []
  const totalBonus = calcAchievementBonus(unlocked)

  const getProgress = (ach) => {
    let current = 0
    if (ach.type === 'totalSeelen')     current = totalCollected.seelen ?? 0
    else if (ach.type === 'totalPlayTime') current = stats.totalPlayTime ?? 0
    else current = stats[ach.type] ?? 0
    return Math.min(1, current / ach.goal)
  }

  return (
    <GrimPanel>
      <PanelHeader icon="🏆" title="Achievements" subtitle={`${unlocked.length}/${ACHIEVEMENTS.length} freigeschaltet — Gesamt-Bonus: ×${totalBonus.toFixed(2)}`} />
      <div className="grimPanel-body">

        {/* Bonus summary */}
        <div style={{
          padding: '10px 14px',
          background: 'rgba(74,0,0,0.15)',
          borderRadius: '8px',
          border: '1px solid rgba(74,0,0,0.3)',
          fontFamily: 'JetBrains Mono',
          fontSize: '12px',
          color: '#c9a227',
        }}>
          ✦ Aktueller Achievement-Produktionsbonus: ×{totalBonus.toFixed(2)}
          <span style={{ color: '#4a4048', marginLeft: '8px' }}>
            ({Math.round((totalBonus - 1) * 100)}% über Basis)
          </span>
        </div>

        {/* Achievement list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {ACHIEVEMENTS.map((ach) => {
            const done = unlocked.includes(ach.id)
            const pct  = getProgress(ach)

            return (
              <div
                key={ach.id}
                style={{
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: done
                    ? '1px solid rgba(201,162,39,0.35)'
                    : '1px solid rgba(42,32,40,0.4)',
                  background: done
                    ? 'rgba(201,162,39,0.08)'
                    : 'rgba(15,10,21,0.7)',
                  opacity: done ? 1 : pct > 0 ? 0.85 : 0.45,
                  transition: 'all 0.2s',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                  <span style={{ fontSize: '20px', lineHeight: 1, marginTop: '2px' }}>{ach.icon}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <span style={{ fontFamily: 'Cinzel', fontSize: '12px', color: done ? '#c9a227' : '#6b5f6a', fontWeight: 600 }}>
                        {ach.title}
                      </span>
                      {done && (
                        <span style={{ fontFamily: 'JetBrains Mono', fontSize: '10px', color: '#4ade80' }}>✓ Freigeschaltet</span>
                      )}
                    </div>
                    <div style={{ fontFamily: 'EB Garamond', fontSize: '12px', color: '#4a4048', fontStyle: 'italic', marginTop: '2px' }}>
                      {ach.desc}
                    </div>
                    <div style={{ fontFamily: 'JetBrains Mono', fontSize: '10px', color: done ? '#c9a227' : '#2a2028', marginTop: '3px' }}>
                      Bonus: {ach.bonusLabel}
                    </div>
                    {!done && (
                      <div style={{ marginTop: '6px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'JetBrains Mono', fontSize: '10px', color: '#2a2028', marginBottom: '3px' }}>
                          <span>Fortschritt</span>
                          <span>{Math.round(pct * 100)}%</span>
                        </div>
                        <div style={{ height: '3px', background: '#1a0f1a', borderRadius: '2px', overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${pct * 100}%`, background: '#4a0000', transition: 'width 0.5s' }} />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </GrimPanel>
  )
}
