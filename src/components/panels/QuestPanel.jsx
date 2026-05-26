import { useGameStore } from '../../store/gameStore'
import { RES } from '../../utils/constants'
import { fmt } from '../../utils/helpers'
import { PANEL_STYLE, PanelHeader, Btn, Card, ProgressBar, SLabel, Divider, C } from '../ui/primitives'

function QuestCard({ q, onClaim }) {
  const pct = q.goal > 0 ? Math.min(1, (q.progress ?? 0) / q.goal) : 0

  return (
    <Card style={{
      border: `1px solid ${q.claimed ? C.borderDim : q.completed ? '#16653460' : C.borderDim}`,
      opacity: q.claimed ? 0.45 : 1,
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '3px' }}>
            <span style={{ fontFamily: 'Cinzel', fontSize: '12px', color: q.claimed ? C.textDim : C.gold }}>{q.title}</span>
            {q.completed && !q.claimed && <span style={{ fontFamily: 'JetBrains Mono', fontSize: '9px', color: C.green }}>✓ Abgeschlossen!</span>}
            {q.claimed && <span style={{ fontFamily: 'JetBrains Mono', fontSize: '9px', color: C.textSub }}>Kassiert</span>}
          </div>
          <div style={{ fontFamily: 'EB Garamond', fontSize: '12px', color: C.textDim, fontStyle: 'italic', marginBottom: '6px' }}>{q.desc}</div>

          {!q.claimed && (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'JetBrains Mono', fontSize: '10px', color: C.textSub, marginBottom: '3px' }}>
                <span>Fortschritt</span><span>{Math.min(q.progress ?? 0, q.goal)}/{q.goal}</span>
              </div>
              <ProgressBar value={q.progress ?? 0} max={q.goal} color={q.completed ? '#166534' : '#4a0000'} height={4} />
            </>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', marginTop: '6px' }}>
            <span style={{ fontFamily: 'JetBrains Mono', fontSize: '9px', color: C.textSub }}>Belohnung:</span>
            {Object.entries(q.reward).map(([k, v]) => (
              <span key={k} style={{ fontFamily: 'JetBrains Mono', fontSize: '10px', color: RES[k]?.hex ?? C.text }}>
                {RES[k]?.icon ?? k} {fmt(v)}
              </span>
            ))}
          </div>
        </div>
        {q.completed && !q.claimed && (
          <Btn onClick={onClaim} variant="green" style={{ flexShrink: 0 }}>Kassieren</Btn>
        )}
      </div>
    </Card>
  )
}

export default function QuestPanel() {
  const quests    = useGameStore(s => s.quests)
  const claimQuest = useGameStore(s => s.claimQuest)

  const msLeft = Math.max(0, (quests.lastRefresh ?? 0) + 86_400_000 - Date.now())
  const h = Math.floor(msLeft / 3_600_000)
  const m = Math.floor((msLeft % 3_600_000) / 60_000)

  return (
    <div style={PANEL_STYLE}>
      <PanelHeader icon="🎯" title="Quests" subtitle={`Tagesquests — Reset in ${h}h ${m}m`} />
      <div className="panel-scroll" style={{ padding: '14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <SLabel>Tagesquests</SLabel>
        {(quests.daily ?? []).map(q => (
          <QuestCard key={q.id} q={q} onClaim={() => claimQuest(q.id, 'daily')} />
        ))}
        <Divider />
        <SLabel>Meilensteine</SLabel>
        {(quests.milestones ?? []).map(q => (
          <QuestCard key={q.id} q={q} onClaim={() => claimQuest(q.id, 'milestones')} />
        ))}
      </div>
    </div>
  )
}
