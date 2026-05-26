import { useGameStore } from '../../store/gameStore'
import { SUMMONS, RESEARCH, RES } from '../../utils/constants'
import { canAfford } from '../../utils/helpers'
import { PANEL_STYLE, PanelHeader, Btn, Card, ProgressBar, SLabel, Divider, EmptyHint, C } from '../ui/primitives'

const TIER_COLOR = ['', '#a8a29e', '#ef4444', '#c084fc', '#c9a227']

export default function SummoningPanel() {
  const resources    = useGameStore(s => s.resources)
  const researchDone = useGameStore(s => s.researchDone)
  const summons      = useGameStore(s => s.summons)
  const doSummon     = useGameStore(s => s.summon)
  const dismiss      = useGameStore(s => s.dismissSummon)

  const unlocked = researchDone.includes('ersteBeschwoerung')
  const disc     = researchDone.includes('dunklePakte') ? 0.7 : 1.0

  return (
    <div style={PANEL_STYLE}>
      <PanelHeader icon="🔮" title="Beschwörung" subtitle="Rufe Wesen aus dem Jenseits" />
      <div className="panel-scroll" style={{ padding: '14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>

        {!unlocked && (
          <Card style={{ textAlign: 'center', padding: '20px' }}>
            <div style={{ fontSize: '32px', opacity: 0.2, marginBottom: '8px' }}>🔮</div>
            <div style={{ fontFamily: 'EB Garamond', fontSize: '13px', color: C.textDim, fontStyle: 'italic' }}>
              Erforsche "Erste Beschwörung" um Wesen zu rufen.
            </div>
          </Card>
        )}

        <SLabel>Verfügbare Wesen</SLabel>
        {Object.entries(SUMMONS).map(([id, def]) => {
          const prereqsMet = def.requires.every(r => researchDone.includes(r))
          const costs      = Object.fromEntries(Object.entries(def.cost).map(([k, v]) => [k, Math.floor(v * disc)]))
          const afford     = canAfford(resources, costs)
          const avail      = unlocked && prereqsMet

          return (
            <Card key={id} style={{ opacity: avail ? 1 : 0.4 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                <span style={{ fontSize: '24px', lineHeight: 1, marginTop: '2px' }}>{def.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontFamily: 'Cinzel', fontSize: '12px', color: C.gold }}>{def.name}</span>
                    <span style={{ fontFamily: 'JetBrains Mono', fontSize: '9px', color: TIER_COLOR[def.tier] }}>Tier {def.tier}</span>
                  </div>
                  <div style={{ fontFamily: 'EB Garamond', fontSize: '12px', color: C.textDim, fontStyle: 'italic', marginTop: '2px' }}>{def.desc}</div>
                  <div style={{ fontFamily: 'JetBrains Mono', fontSize: '10px', color: C.textSub, marginTop: '3px' }}>
                    LP:{def.stats.hp} ATK:{def.stats.atk} DEF:{def.stats.def} Krit:{Math.round(def.stats.crit*100)}%
                  </div>
                  <div style={{ fontFamily: 'JetBrains Mono', fontSize: '10px', color: afford ? C.gold : C.textSub, marginTop: '3px' }}>
                    {Object.entries(costs).map(([k, v]) => `${v} ${RES[k]?.icon ?? k}`).join(' · ')}
                    {disc < 1 && <span style={{ color: C.green }}> (-30%)</span>}
                  </div>
                  {!prereqsMet && (
                    <div style={{ fontFamily: 'JetBrains Mono', fontSize: '9px', color: '#ef4444', marginTop: '2px' }}>
                      Benötigt: {def.requires.map(r => RESEARCH[r]?.name ?? r).join(', ')}
                    </div>
                  )}
                </div>
                <Btn onClick={() => doSummon(id)} disabled={!avail || !afford} variant="blood">Beschwören</Btn>
              </div>
            </Card>
          )
        })}

        {summons.length > 0 && (
          <>
            <Divider />
            <SLabel>Aktive Wesen ({summons.length})</SLabel>
            {summons.map(s => (
              <Card key={s.id} style={{ border: '1px solid rgba(74,0,0,0.3)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <span style={{ fontSize: '18px' }}>{s.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: 'Cinzel', fontSize: '11px', color: C.gold }}>{s.name}</div>
                    <div style={{ fontFamily: 'JetBrains Mono', fontSize: '10px', color: C.textDim }}>LP {s.hp}/{s.stats.hp}</div>
                  </div>
                  <button onClick={() => dismiss(s.id)} style={{ fontFamily: 'JetBrains Mono', fontSize: '10px', color: C.textSub, background: 'none', border: 'none', cursor: 'pointer' }} title="Entlassen">✕</button>
                </div>
                <ProgressBar value={s.hp} max={s.stats.hp} color="#4a0000" height={3} />
              </Card>
            ))}
          </>
        )}

        {summons.length === 0 && unlocked && (
          <EmptyHint icon="💀" text="Keine Wesen aktiv. Beschwöre Wesen um Bosse herauszufordern." />
        )}
      </div>
    </div>
  )
}
