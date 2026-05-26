import { useGameStore } from '../../store/gameStore'
import { RES, BASIC_RES, RARE_RES } from '../../utils/constants'
import { calcRates } from '../../systems/production'
import { fmt, fmtPlayTime } from '../../utils/helpers'
import { PANEL_STYLE, PanelHeader, ProgressBar, Card, SLabel, Divider, C } from '../ui/primitives'

export default function DashboardPanel() {
  const state = useGameStore(s => s)
  const { resources, player, stats, prestige, quests, bossFight, achievements } = state
  const rates = calcRates(state)

  const xpPct       = Math.min(100, (player.xp / player.xpToNext) * 100)
  const questsDone  = [...(quests.daily ?? []), ...(quests.milestones ?? [])].filter(q => q.claimed).length
  const questsTotal = (quests.daily?.length ?? 0) + (quests.milestones?.length ?? 0)
  const achCount    = achievements.unlocked.length

  return (
    <div style={PANEL_STYLE}>
      <PanelHeader icon="📖" title="Das Grim Ledger" subtitle="Verfluchtes Archiv der verlorenen Seelen" />
      <div className="panel-scroll" style={{ padding: '14px', display: 'flex', flexDirection: 'column', gap: '12px' }}>

        {/* Soul counter hero */}
        <Card style={{ textAlign: 'center', background: 'radial-gradient(ellipse, rgba(74,0,0,0.2) 0%, transparent 70%)', position: 'relative' }}>
          <div style={{ fontFamily: 'JetBrains Mono', fontSize: '9px', color: '#4a0000', textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: '6px' }}>Seelen im Ledger</div>
          <div className="anim-flicker" style={{ fontFamily: 'Cinzel', fontSize: '40px', color: '#8b0000', fontWeight: 700, lineHeight: 1, textShadow: '0 0 24px rgba(139,0,0,0.5)' }}>
            {fmt(resources.seelen ?? 0)}
          </div>
          {(rates.seelen ?? 0) > 0 && (
            <div style={{ fontFamily: 'JetBrains Mono', fontSize: '10px', color: C.textDim, marginTop: '4px' }}>
              +{(rates.seelen).toFixed(3)}/s
            </div>
          )}
        </Card>

        {/* Player level */}
        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
            <div style={{ fontFamily: 'Cinzel', fontSize: '11px', color: C.gold }}>Archivar — Stufe {player.level}</div>
            <div style={{ fontFamily: 'JetBrains Mono', fontSize: '10px', color: C.textDim }}>{fmt(player.xp)}/{fmt(player.xpToNext)} XP</div>
          </div>
          <ProgressBar value={player.xp} max={player.xpToNext} color="#8b0000" height={4} />
        </Card>

        {/* Basic resources grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
          {BASIC_RES.filter(k => k !== 'seelen').map(k => {
            const r   = RES[k]
            const val = resources[k] ?? 0
            const rate = rates[k] ?? 0
            if (val < 0.01 && rate < 0.001) return null
            return (
              <Card key={k} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '18px' }}>{r.icon}</span>
                <div>
                  <div style={{ fontFamily: 'JetBrains Mono', fontSize: '9px', color: C.textSub }}>{r.name}</div>
                  <div style={{ fontFamily: 'JetBrains Mono', fontSize: '12px', color: r.hex, fontWeight: 500 }}>{fmt(val)}</div>
                  {rate > 0.001 && <div style={{ fontFamily: 'JetBrains Mono', fontSize: '9px', color: C.textSub }}>{rate.toFixed(3)}/s</div>}
                </div>
              </Card>
            )
          })}
        </div>

        {/* Rare resources */}
        {RARE_RES.some(k => (resources[k] ?? 0) > 0) && (
          <>
            <SLabel>Seltene Ressourcen</SLabel>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
              {RARE_RES.map(k => {
                const r = RES[k]
                const val = resources[k] ?? 0
                if (val < 0.01) return null
                return (
                  <Card key={k} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '16px' }}>{r.icon}</span>
                    <div>
                      <div style={{ fontFamily: 'JetBrains Mono', fontSize: '9px', color: C.textSub }}>{r.name}</div>
                      <div style={{ fontFamily: 'JetBrains Mono', fontSize: '12px', color: r.hex }}>{fmt(val)}</div>
                    </div>
                  </Card>
                )
              })}
            </div>
          </>
        )}

        {/* Abyss marks */}
        {(resources.abyssMarken ?? 0) > 0 && (
          <Card style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '18px' }}>⬡</span>
            <div>
              <div style={{ fontFamily: 'JetBrains Mono', fontSize: '9px', color: C.textSub }}>Abyss-Marken</div>
              <div style={{ fontFamily: 'JetBrains Mono', fontSize: '14px', color: RES.abyssMarken.hex }}>{fmt(resources.abyssMarken)}</div>
            </div>
          </Card>
        )}

        <Divider />

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
          {[
            { icon: '⬡', label: 'Aufstieg', value: `#${prestige.count}`, color: C.gold },
            { icon: '🎯', label: 'Quests', value: `${questsDone}/${questsTotal}`, color: C.green },
            { icon: '🏆', label: 'Achievements', value: achCount, color: '#f59e0b' },
            { icon: '⏱️', label: 'Spielzeit', value: fmtPlayTime(stats.playTime), color: C.textDim },
            { icon: '⚔️', label: 'Bosse', value: stats.bossKilled, color: '#ef4444' },
            { icon: '📜', label: 'Forschung', value: stats.researched, color: C.runeLight },
          ].map(({ icon, label, value, color }) => (
            <Card key={label} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '16px', marginBottom: '4px' }}>{icon}</div>
              <div style={{ fontFamily: 'JetBrains Mono', fontSize: '11px', color, fontWeight: 500 }}>{value}</div>
              <div style={{ fontFamily: 'JetBrains Mono', fontSize: '9px', color: C.textSub, marginTop: '2px' }}>{label}</div>
            </Card>
          ))}
        </div>

        {/* Active boss fight */}
        {bossFight && (
          <>
            <Divider />
            <Card style={{ border: '1px solid rgba(139,0,0,0.4)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <span className="anim-flicker" style={{ fontSize: '20px' }}>{bossFight.bossIcon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: 'Cinzel', fontSize: '12px', color: '#ef4444' }}>{bossFight.bossName}</div>
                  <div style={{ fontFamily: 'JetBrains Mono', fontSize: '10px', color: C.textDim }}>{fmt(bossFight.hp)} / {fmt(bossFight.maxHp)} LP</div>
                </div>
              </div>
              <ProgressBar value={bossFight.hp} max={bossFight.maxHp} color="#8b0000" />
            </Card>
          </>
        )}
      </div>
    </div>
  )
}
