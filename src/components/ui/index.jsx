import { clsx } from 'clsx'
import { RESOURCES } from '../../utils/constants'

export function GrimPanel({ id, children, className }) {
  return <div id={id} className={clsx('grimPanel', className)}>{children}</div>
}

export function PanelHeader({ icon, title, subtitle }) {
  return (
    <div className="grimPanel-header">
      <span className="text-xl leading-none">{icon}</span>
      <div className="flex-1 min-w-0">
        <h2 className="font-display text-sm font-semibold text-gold leading-tight truncate tracking-wider">{title}</h2>
        {subtitle && <div className="font-mono text-xs text-ash leading-tight mt-0.5">{subtitle}</div>}
      </div>
    </div>
  )
}

export function Btn({ onClick, disabled, variant = 'blood', children, className, title }) {
  return (
    <button onClick={onClick} disabled={disabled} title={title}
      className={clsx(`btn-${variant}`, className)}>
      {children}
    </button>
  )
}

export function StatCard({ label, value, color = 'text-gold', className }) {
  return (
    <div className={clsx('statCard', className)}>
      <div className="statLabel">{label}</div>
      <div className={clsx('statValue', color)}>{value}</div>
    </div>
  )
}

export function ProgressBar({ value, max, colorClass = 'bg-blood', className }) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0
  return (
    <div className={clsx('progressTrack', className)}>
      <div className={clsx('progressFill', colorClass)} style={{ width: `${pct}%` }} />
    </div>
  )
}

export function ResourceBadge({ resKey, amount, showLabel = false }) {
  const def = RESOURCES[resKey]
  if (!def) return null
  return (
    <span className={clsx('grimBadge border-ash/30 bg-void/80', def.color)}>
      {def.icon} {amount}
      {showLabel && <span className="text-ash ml-1">{def.name}</span>}
    </span>
  )
}

export function GrimBadge({ children, variant = 'default', className }) {
  const c = {
    default: 'border-ash/40 bg-void/80 text-ash-light',
    blood:   'border-blood-dark/60 bg-blood-dark/20 text-red-400',
    gold:    'border-gold-dark/50 bg-gold-dark/10 text-gold',
    rune:    'border-rune/50 bg-rune/10 text-rune-light',
    green:   'border-emerald-800/50 bg-emerald-950/20 text-emerald-400',
  }
  return <span className={clsx('grimBadge', c[variant], className)}>{children}</span>
}

export function GrimDivider({ className }) {
  return <div className={clsx('grimDivider', className)} />
}

export function EmptyState({ icon, text }) {
  return (
    <div className="py-8 text-center space-y-2">
      <div className="text-4xl opacity-20 animate-flicker">{icon}</div>
      <p className="text-ash font-body italic text-sm">{text}</p>
    </div>
  )
}

export function SectionLabel({ children }) {
  return <div className="sectionLabel">{children}</div>
}

export function ResRow({ resKey, amount, rate }) {
  const def = RESOURCES[resKey]
  if (!def) return null
  return (
    <div className="flex items-center justify-between py-1 border-b border-blood-dark/15 last:border-0">
      <span className={clsx('flex items-center gap-1.5 text-sm font-mono', def.color)}>
        <span>{def.icon}</span>
        <span>{def.name}</span>
      </span>
      <div className="text-right">
        <div className="font-mono text-sm text-[#c8b89a]">{amount}</div>
        {rate !== undefined && <div className="font-mono text-xs text-ash">{rate}</div>}
      </div>
    </div>
  )
}
