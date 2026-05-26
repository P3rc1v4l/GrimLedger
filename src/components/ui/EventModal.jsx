import { useGameStore } from '../../store/gameStore'
import { canAfford } from '../../utils/helpers'

export default function EventModal() {
  const { activeEvent, resources, acceptEvent, rejectEvent } = useGameStore((s) => ({
    activeEvent: s.activeEvent,
    resources: s.resources,
    acceptEvent: s.acceptEvent,
    rejectEvent: s.rejectEvent,
  }))

  if (!activeEvent) return null

  const ev = activeEvent
  const canReject = !ev.rejectCost || canAfford(resources, ev.rejectCost)
  const typeColor = { positive: '#4ade80', negative: '#ef4444', choice: '#c9a227' }[ev.type] ?? '#c8b89a'
  const typeLabel = { positive: '✦ Positives Ereignis', negative: '⚠️ Negatives Ereignis', choice: '⚖️ Entscheidung' }[ev.type] ?? 'Ereignis'

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 80,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'rgba(0,0,0,0.7)',
    }}>
      <div style={{
        width: '100%', maxWidth: '420px', margin: '0 16px',
        background: 'linear-gradient(160deg, #1e1428 0%, #150f1e 100%)',
        border: `1px solid ${typeColor}40`,
        borderRadius: '14px',
        boxShadow: `0 0 40px ${typeColor}20, 0 8px 32px rgba(0,0,0,0.8)`,
        overflow: 'hidden',
      }}>
        {/* Color accent top bar */}
        <div style={{ height: '3px', background: typeColor }} />

        <div style={{ padding: '20px' }}>
          {/* Header */}
          <div style={{ marginBottom: '14px' }}>
            <div style={{ fontFamily: 'JetBrains Mono', fontSize: '10px', color: typeColor, textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '6px' }}>
              {typeLabel}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '32px' }}>{ev.icon}</span>
              <h3 style={{ fontFamily: 'Cinzel', fontSize: '18px', color: '#c9a227', fontWeight: 600 }}>
                {ev.title}
              </h3>
            </div>
          </div>

          {/* Description */}
          <p style={{ fontFamily: 'EB Garamond', fontSize: '15px', color: '#c8b89a', lineHeight: 1.65, marginBottom: '18px' }}>
            {ev.desc}
          </p>

          {/* Buttons */}
          <div style={{ display: 'flex', gap: '10px' }}>
            {/* Accept button */}
            <button
              onClick={acceptEvent}
              style={{
                flex: 1,
                fontFamily: 'JetBrains Mono', fontSize: '12px', fontWeight: 500,
                padding: '10px 14px',
                borderRadius: '7px',
                border: `1px solid ${typeColor}60`,
                background: `${typeColor}18`,
                color: typeColor,
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = `${typeColor}30` }}
              onMouseLeave={(e) => { e.currentTarget.style.background = `${typeColor}18` }}
            >
              {ev.acceptLabel}
            </button>

            {/* Reject button */}
            <button
              onClick={rejectEvent}
              style={{
                flex: 1,
                fontFamily: 'JetBrains Mono', fontSize: '12px', fontWeight: 500,
                padding: '10px 14px',
                borderRadius: '7px',
                border: '1px solid rgba(74,64,72,0.5)',
                background: 'rgba(42,32,40,0.4)',
                color: canReject ? '#c8b89a' : '#4a4048',
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
              onMouseEnter={(e) => { if (canReject) e.currentTarget.style.background = 'rgba(74,64,72,0.5)' }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(42,32,40,0.4)' }}
            >
              {ev.rejectLabel}
              {ev.rejectCost && !canReject && <span style={{ color: '#ef4444', marginLeft: '4px' }}>(zu wenig)</span>}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
