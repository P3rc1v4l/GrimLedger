import { useGameStore } from '../../store/gameStore'
const COLORS = {
  success: { bg: '#0d1f15', border: '#166534', color: '#4ade80' },
  error:   { bg: '#1f0d0d', border: '#7f1d1d', color: '#fca5a5' },
  info:    { bg: '#0d0f1f', border: '#1e3a8a', color: '#93c5fd' },
  prestige:{ bg: '#1a0d0d', border: '#c9a227', color: '#e8c84a' },
}
export default function Notification() {
  const n = useGameStore(s => s.notification)
  if (!n) return null
  const c = COLORS[n.type] ?? COLORS.success
  return (
    <div key={n.id} className="anim-enter" style={{
      position: 'fixed', top: '12px', left: '50%', transform: 'translateX(-50%)',
      zIndex: 200, padding: '8px 18px', borderRadius: '7px',
      fontFamily: 'JetBrains Mono', fontSize: '12px',
      background: c.bg, border: `1px solid ${c.border}`, color: c.color,
      boxShadow: '0 4px 20px rgba(0,0,0,0.6)', pointerEvents: 'none', whiteSpace: 'nowrap',
    }}>
      {n.msg}
    </div>
  )
}
