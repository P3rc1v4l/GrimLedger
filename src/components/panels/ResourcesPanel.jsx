import { useGameStore } from '../../store/gameStore'
import { RES, BASIC_RES, RARE_RES } from '../../utils/constants'
import { calcRates } from '../../systems/production'
import { fmt, fmtRate } from '../../utils/helpers'
import { PANEL_STYLE, PanelHeader, SLabel, Divider, C } from '../ui/primitives'

function ResRow({ resKey, amount, rate }) {
  const r = RES[resKey]
  if (!r) return null
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 0', borderBottom: `1px solid ${C.borderDim}` }}>
      <span style={{ fontFamily: 'JetBrains Mono', fontSize: '12px', color: r.hex, display: 'flex', alignItems: 'center', gap: '6px' }}>
        {r.icon} {r.name}
      </span>
      <div style={{ textAlign: 'right' }}>
        <div style={{ fontFamily: 'JetBrains Mono', fontSize: '12px', color: C.text }}>{fmt(amount)}</div>
        {rate != null && rate > 0 && <div style={{ fontFamily: 'JetBrains Mono', fontSize: '10px', color: C.textSub }}>{fmtRate(rate)}</div>}
      </div>
    </div>
  )
}

export default function ResourcesPanel() {
  const state     = useGameStore(s => s)
  const { resources } = state
  const rates     = calcRates(state)

  return (
    <div style={PANEL_STYLE}>
      <PanelHeader icon="💀" title="Ressourcen" subtitle="Alle Ressourcen und Produktionsraten" />
      <div className="panel-scroll" style={{ padding: '14px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <SLabel>Grundressourcen</SLabel>
        {BASIC_RES.map(k => <ResRow key={k} resKey={k} amount={resources[k] ?? 0} rate={rates[k] ?? 0} />)}
        <Divider />
        <SLabel>Seltene Ressourcen</SLabel>
        {RARE_RES.map(k => <ResRow key={k} resKey={k} amount={resources[k] ?? 0} rate={rates[k] ?? 0} />)}
        <Divider />
        <SLabel>Prestige-Währung</SLabel>
        <ResRow resKey="abyssMarken" amount={resources.abyssMarken ?? 0} />
      </div>
    </div>
  )
}
