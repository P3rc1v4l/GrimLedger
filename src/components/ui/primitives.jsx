// ─── Design tokens ────────────────────────────────────────────────────────────
export const C = {
  bg0:    '#16101e',   // app background
  bg1:    '#1e1428',   // panel background
  bg2:    '#261a30',   // elevated card
  bg3:    '#2e1f38',   // hover state
  border: '#3a1f4a',   // default border
  borderDim: '#2a1535',
  text:   '#c8b89a',   // primary text
  textDim:'#6b5f6a',   // secondary text
  textSub:'#4a4048',   // hint text
  blood:  '#8b0000',
  bloodLight: '#ef4444',
  gold:   '#c9a227',
  goldLight: '#e8c84a',
  rune:   '#9333ea',
  runeLight: '#c084fc',
  green:  '#4ade80',
}

export const PANEL_STYLE = {
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  minHeight: 0,
  background: `linear-gradient(160deg, ${C.bg1} 0%, ${C.bg0} 100%)`,
  border: `1px solid ${C.border}`,
  borderRadius: '12px',
  overflow: 'hidden',
  boxShadow: '0 8px 32px rgba(0,0,0,0.7)',
}

export const PANEL_HEADER_STYLE = {
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  padding: '14px 16px 12px',
  borderBottom: `1px solid ${C.borderDim}`,
  flexShrink: 0,
}

// ─── UI Components ────────────────────────────────────────────────────────────

export function PanelHeader({ icon, title, subtitle }) {
  return (
    <div style={PANEL_HEADER_STYLE}>
      <span style={{ fontSize: '20px', lineHeight: 1 }}>{icon}</span>
      <div style={{ flex: 1 }}>
        <div style={{ fontFamily: 'Cinzel', fontSize: '13px', fontWeight: 600, color: C.gold, letterSpacing: '0.06em' }}>{title}</div>
        {subtitle && <div style={{ fontFamily: 'JetBrains Mono', fontSize: '10px', color: C.textDim, marginTop: '2px' }}>{subtitle}</div>}
      </div>
    </div>
  )
}

export function Btn({ onClick, disabled, children, variant = 'default', style = {} }) {
  const variants = {
    default: { border: `1px solid ${C.border}`,     bg: C.bg2,          color: C.text,       hBg: C.bg3 },
    blood:   { border: '1px solid #4a0000',          bg: 'rgba(74,0,0,0.35)',   color: '#ef4444', hBg: 'rgba(139,0,0,0.45)' },
    gold:    { border: `1px solid ${C.gold}55`,      bg: 'rgba(201,162,39,0.2)', color: C.gold,  hBg: 'rgba(201,162,39,0.3)' },
    rune:    { border: `1px solid ${C.rune}66`,      bg: 'rgba(147,51,234,0.15)',color: C.runeLight, hBg: 'rgba(147,51,234,0.25)' },
    danger:  { border: '1px solid #7f1d1d',          bg: 'rgba(127,29,29,0.3)', color: '#fca5a5', hBg: 'rgba(185,28,28,0.4)' },
    green:   { border: '1px solid #166534',          bg: 'rgba(22,101,52,0.3)', color: C.green,   hBg: 'rgba(22,101,52,0.45)' },
  }
  const v = variants[variant] ?? variants.default
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '5px',
        fontFamily: 'JetBrains Mono', fontSize: '11px', fontWeight: 500,
        padding: '7px 14px', borderRadius: '6px',
        border: v.border, background: v.bg, color: disabled ? C.textSub : v.color,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.4 : 1,
        transition: 'all 0.13s',
        whiteSpace: 'nowrap',
        ...style,
      }}
      onMouseEnter={e => { if (!disabled) e.currentTarget.style.background = v.hBg }}
      onMouseLeave={e => { if (!disabled) e.currentTarget.style.background = v.bg }}
    >
      {children}
    </button>
  )
}

export function ProgressBar({ value, max, color = C.blood, height = 5 }) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0
  return (
    <div style={{ width: '100%', height, borderRadius: 9999, background: '#1a0f1a', overflow: 'hidden' }}>
      <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 9999, transition: 'width 0.6s ease-out' }} />
    </div>
  )
}

export function Card({ children, style = {}, glow = false }) {
  return (
    <div
      className={glow ? 'anim-glow' : ''}
      style={{ background: C.bg2, border: `1px solid ${C.borderDim}`, borderRadius: '8px', padding: '10px 12px', ...style }}
    >
      {children}
    </div>
  )
}

export function SLabel({ children }) {
  return (
    <div style={{ fontFamily: 'JetBrains Mono', fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.18em', color: '#4a0000', marginBottom: '6px' }}>
      {children}
    </div>
  )
}

export function Divider() {
  return <div style={{ borderTop: `1px solid ${C.borderDim}`, margin: '8px -16px' }} />
}

export function EmptyHint({ icon, text }) {
  return (
    <div style={{ textAlign: 'center', padding: '24px 0' }}>
      <div style={{ fontSize: '32px', opacity: 0.2, marginBottom: '8px' }}>{icon}</div>
      <div style={{ fontFamily: 'EB Garamond', fontSize: '13px', color: C.textDim, fontStyle: 'italic' }}>{text}</div>
    </div>
  )
}

export function ResTag({ icon, value, color }) {
  return (
    <span style={{ fontFamily: 'JetBrains Mono', fontSize: '10px', color: color ?? C.textDim, display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
      {icon} {value}
    </span>
  )
}

export function Badge({ children, color = C.textDim, bg = C.bg2, border = C.border }) {
  return (
    <span style={{ fontFamily: 'JetBrains Mono', fontSize: '10px', color, background: bg, border: `1px solid ${border}`, borderRadius: '4px', padding: '1px 5px' }}>
      {children}
    </span>
  )
}
