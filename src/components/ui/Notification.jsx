import { useGameStore } from '../../store/gameStore'
import { clsx } from 'clsx'

export default function Notification() {
  const n = useGameStore((s) => s.notification)
  if (!n) return null
  const c = {
    success:  'border-emerald-700/60 bg-emerald-950/90 text-emerald-300',
    error:    'border-red-700/60 bg-red-950/90 text-red-300',
    info:     'border-blue-700/60 bg-blue-950/90 text-blue-300',
    prestige: 'border-violet-600/70 bg-violet-950/90 text-violet-200',
  }
  return (
    <div key={n.id} className={clsx('fixed top-16 left-1/2 -translate-x-1/2 z-50 border rounded-lg px-4 py-2 font-mono text-xs shadow-xl animate-popIn pointer-events-none whitespace-nowrap', c[n.type] ?? c.success)}>
      {n.msg}
    </div>
  )
}
