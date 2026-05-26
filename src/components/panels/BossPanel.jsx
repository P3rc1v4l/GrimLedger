import { useGameStore } from '../../store/gameStore'
import { BOSSES, RES } from '../../utils/constants'
import { canAfford, fmt } from '../../utils/helpers'
import { PANEL_STYLE, PanelHeader, Btn, Card, ProgressBar, SLabel, C } from '../ui/primitives'

export default function BossPanel() {
  const resources  = useGameStore(s => s.resources)
  const summons    = useGameStore(s => s.summons)
  const bossFight  = useGameStore(s => s.bossFight)
  const bossKilled = useGameStore(s => s.stats.bossKilled)
  const startBoss  = useGameStore(s => s.startBoss)
  const fleeBoss   = useGameStore(s => s.fleeBoss)

  return (
    <div style={PANEL_STYLE}>
      <PanelHeader icon="⚔️" title="Bosse" subtitle="Herausforderungen des Dunkels" />
      <div className="panel-scroll" style={{ padding: '14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>

        {/* Active fight */}
        {bossFight && (
          <Card style={{ border: '1px solid rgba(139,0,0,0.5)', marginBottom: '4px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
              <span className="anim-flicker" style={{ fontSize: '28px' }}>{bossFight.bossIcon}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: 'Cinzel', fontSize: '14px', color: '#ef4444' }}>{bossFight.bossName}</div>
                <div style={{ fontFamily: 'JetBrains Mono', fontSize: '10px', color: C.textDim }}>{fmt(bossFight.hp)} / {fmt(bossFight.maxHp)} LP</div>
              </div>
              <Btn onClick={fleeBoss} variant="danger">Fliehen</Btn>
            </div>
            <ProgressBar value={bossFight.hp} max={bossFight.maxHp} color="#8b0000" />
            <div style={{ fontFamily: 'JetBrains Mono', fontSize: '10px', color: C.textDim, marginTop: '6px' }}>
              {summons.length} Wesen kämpfen — ATK {summons.reduce((s, u) => s + u.stats.atk, 0)} DEF {summons.reduce((s, u) => s + u.stats.def, 0)}
            </div>
          </Card>
        )}

        <SLabel>Herausforderungen</SLabel>
        {BOSSES.map((boss, idx) => {
          const beaten     = bossKilled >= idx + 1
          const canStart   = canAfford(resources, boss.unlockCost) && summons.length > 0 && !bossFight
          const isActive   = bossFight?.bossId === boss.id

          return (
            <Card key={boss.id} style={{ border: `1px solid ${isActive ? 'rgba(139,0,0,0.6)' : C.borderDim}`, opacity: canAfford(resources, boss.unlockCost) || beaten ? 1 : 0.5 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                <span className={isActive ? 'anim-flicker' : ''} style={{ fontSize: '24px', lineHeight: 1, marginTop: '2px' }}>{boss.icon}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '3px' }}>
                    <span style={{ fontFamily: 'Cinzel', fontSize: '13px', color: C.gold }}>{boss.name}</span>
                    <span style={{ fontFamily: 'JetBrains Mono', fontSize: '9px', color: C.textDim }}>Tier {boss.tier}</span>
                    {beaten && <span style={{ fontFamily: 'JetBrains Mono', fontSize: '9px', color: C.green }}>✓ Besiegt</span>}
                  </div>
                  <div style={{ fontFamily: 'EB Garamond', fontSize: '12px', color: C.textDim, fontStyle: 'italic', marginBottom: '4px' }}>{boss.desc}</div>
                  <div style={{ fontFamily: 'JetBrains Mono', fontSize: '10px', color: C.textSub }}>LP: {fmt(boss.hp)} · ATK: {boss.atk} · DEF: {boss.def}</div>
                  <div style={{ fontFamily: 'JetBrains Mono', fontSize: '10px', color: C.textSub, marginTop: '2px' }}>
                    Kosten: {Object.entries(boss.unlockCost).map(([k, v]) => `${fmt(v)} ${RES[k]?.icon ?? k}`).join(' · ')}
                  </div>
                  <div style={{ fontFamily: 'JetBrains Mono', fontSize: '10px', color: '#4ade8060', marginTop: '2px' }}>
                    Belohnung: {Object.entries(boss.reward).map(([k, v]) => `${RES[k]?.icon ?? k} ${fmt(v)}`).join(' ')}
                  </div>
                </div>
                <Btn onClick={() => startBoss(boss.id)} disabled={!canStart} variant={canStart ? 'blood' : 'default'}>
                  {isActive ? 'Aktiv' : 'Herausfordern'}
                </Btn>
              </div>
            </Card>
          )
        })}

        {summons.length === 0 && !bossFight && (
          <div style={{ fontFamily: 'JetBrains Mono', fontSize: '11px', color: C.textSub, textAlign: 'center', padding: '8px' }}>
            ⚠️ Beschwöre zuerst Wesen um Bosse anzugreifen.
          </div>
        )}
      </div>
    </div>
  )
}
