import { useGameStore } from '../../store/gameStore'
import { canAfford } from '../../utils/helpers'
import { Btn, C } from './primitives'

const KIND_COLOR = { positive: '#4ade80', negative: '#ef4444', choice: '#c9a227' }
const KIND_LABEL = { positive: '✦ Positives Ereignis', negative: '⚠️ Negatives Ereignis', choice: '⚖️ Entscheidung' }

export default function EventModal() {
  const { ev, resources, accept, reject } = useGameStore(s => ({
    ev: s.activeEvent, resources: s.resources, accept: s.acceptEvent, reject: s.rejectEvent,
  }))
  if (!ev) return null
  const col = KIND_COLOR[ev.kind] ?? '#c8b89a'
  const canReject = !ev.rejectCost || canAfford(resources, ev.rejectCost)

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 80, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.75)' }}>
      <div className="anim-enter" style={{ width: '400px', maxWidth: '90vw', background: '#1e1428', border: `1px solid ${col}44`, borderRadius: '12px', overflow: 'hidden', boxShadow: `0 0 40px ${col}20, 0 8px 32px rgba(0,0,0,0.8)` }}>
        <div style={{ height: '3px', background: col }} />
        <div style={{ padding: '18px' }}>
          <div style={{ fontFamily: 'JetBrains Mono', fontSize: '9px', color: col, textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '8px' }}>{KIND_LABEL[ev.kind]}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
            <span style={{ fontSize: '28px' }}>{ev.icon}</span>
            <span style={{ fontFamily: 'Cinzel', fontSize: '16px', color: C.gold }}>{ev.title}</span>
          </div>
          <p style={{ fontFamily: 'EB Garamond', fontSize: '14px', color: C.text, lineHeight: 1.65, marginBottom: '16px' }}>{ev.desc}</p>
          <div style={{ display: 'flex', gap: '10px' }}>
            <Btn onClick={accept} variant={ev.kind === 'positive' ? 'green' : ev.kind === 'negative' ? 'danger' : 'gold'} style={{ flex: 1, justifyContent: 'center' }}>{ev.acceptLabel}</Btn>
            <Btn onClick={reject} variant="default" style={{ flex: 1, justifyContent: 'center', opacity: canReject ? 1 : 0.5 }}>
              {ev.rejectLabel}{!canReject ? ' ✗' : ''}
            </Btn>
          </div>
        </div>
      </div>
    </div>
  )
}
