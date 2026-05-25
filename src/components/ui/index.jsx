import { clsx } from 'clsx'
import { fmtCost } from '../../utils/helpers'

export function Panel({ id, children, className }) {
  return <div id={id} className={clsx('panel', className)}>{children}</div>
}

export function PanelHeader({ icon, title, level, maxLevel = 10 }) {
  return (
    <div className="panel-header">
      <span className="text-xl leading-none">{icon}</span>
      <div className="flex-1 min-w-0">
        <h2 className="font-display text-sm font-semibold text-amber-200 truncate">{title}</h2>
        {level !== undefined && (
          <div className="flex items-center gap-0.5 mt-1">
            {Array.from({ length: maxLevel }).map((_, i) => (
              <div key={i} className={clsx('h-0.5 flex-1 rounded-full transition-all duration-500', i < level ? 'bg-amber-500' : 'bg-stone-700')} />
            ))}
          </div>
        )}
      </div>
      {level !== undefined && <span className="font-mono text-xs text-stone-500 shrink-0">Lvl {level}</span>}
    </div>
  )
}

export function Btn({ onClick, disabled, variant = 'gold', children, className, title }) {
  return (
    <button onClick={onClick} disabled={disabled} title={title} className={clsx(`btn-${variant}`, className)}>
      {children}
    </button>
  )
}

export function StatCard({ label, value, color = 'text-amber-300' }) {
  return (
    <div className="stat-card">
      <div className="stat-label">{label}</div>
      <div className={clsx('stat-value', color)}>{value}</div>
    </div>
  )
}

export function ProgressBar({ value, max, colorClass = 'bg-amber-500' }) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0
  return (
    <div className="progress-track">
      <div className={clsx('progress-fill', colorClass)} style={{ width: `${pct}%` }} />
    </div>
  )
}

export function Badge({ children, variant = 'default' }) {
  const c = {
    default: 'bg-stone-800/80 text-stone-400 border-stone-700/40',
    gold:    'bg-amber-950/60 text-amber-400 border-amber-800/40',
    green:   'bg-emerald-950/60 text-emerald-400 border-emerald-800/40',
    red:     'bg-red-950/60 text-red-400 border-red-800/40',
    blue:    'bg-blue-950/60 text-blue-400 border-blue-800/40',
    violet:  'bg-violet-950/60 text-violet-400 border-violet-800/40',
  }
  return <span className={clsx('badge', c[variant])}>{children}</span>
}

export function CostLine({ costs }) {
  return <p className="font-mono text-xs text-amber-700/80">{fmtCost(costs)}</p>
}

export function EmptyState({ icon, text }) {
  return (
    <div className="py-6 text-center space-y-1">
      <div className="text-3xl opacity-30">{icon}</div>
      <p className="text-stone-500 text-sm font-body italic">{text}</p>
    </div>
  )
}

export function Divider() {
  return <div className="border-t border-stone-700/30 -mx-4" />
}
