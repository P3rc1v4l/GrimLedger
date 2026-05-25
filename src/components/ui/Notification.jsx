import { useGameStore } from '../../store/gameStore'
import { clsx } from 'clsx'

export default function Notification() {
  const n = useGameStore((s) => s.notification)
  if (!n) return null
  const c = {
    success: 'border-blood-dark/70 bg-[#0d0308] text-red-300',
    error:   'border-red-900/80 bg-[#0d0308] text-red-500',
    info:    'border-rune/60 bg-[#0d0812] text-rune-light',
    prestige:'border-gold-dark/70 bg-[#0d0a08] text-gold animate-flicker',
  }
  return (
    <div key={n.id}
      className={clsx(
        'fixed top-4 left-1/2 -translate-x-1/2 z-[100] border rounded px-4 py-2 font-mono text-xs shadow-2xl pointer-events-none whitespace-nowrap',
        c[n.type] ?? c.success
      )}
    >
      {n.msg}
    </div>
  )
}
