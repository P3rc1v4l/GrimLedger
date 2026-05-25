import { useGameStore } from '../../store/gameStore'
import { GrimPanel, PanelHeader, GrimDivider, SectionLabel, ResRow } from '../ui'
import { RESOURCES } from '../../utils/constants'
import { fmt, fmtRate } from '../../utils/helpers'
import { calcProductionRates } from '../../systems/production'

export default function ResourcesPanel() {
  const state = useGameStore((s) => s)
  const { resources } = state
  const rates = calcProductionRates(state)

  const basic  = ['seelen','knochen','blut','schatten','erinnerungen','asche','wissen','albtraeume']
  const rare   = ['leereFragmente','gottloseEssenz']
  const prestige = ['abyssMarken']

  return (
    <GrimPanel className="h-full flex flex-col">
      <PanelHeader icon="💀" title="Ressourcen" subtitle="Alle Ressourcen und Produktionsraten" />
      <div className="grimPanel-body flex-1 space-y-4">
        <SectionLabel>Grundressourcen</SectionLabel>
        {basic.map((k) => (
          <ResRow key={k} resKey={k}
            amount={fmt(resources[k] ?? 0)}
            rate={rates[k] ? fmtRate(rates[k]) : undefined}
          />
        ))}

        <GrimDivider />
        <SectionLabel>Seltene Ressourcen</SectionLabel>
        {rare.map((k) => (
          <ResRow key={k} resKey={k}
            amount={fmt(resources[k] ?? 0)}
            rate={rates[k] ? fmtRate(rates[k]) : undefined}
          />
        ))}

        <GrimDivider />
        <SectionLabel>Prestige-Währung</SectionLabel>
        {prestige.map((k) => (
          <ResRow key={k} resKey={k} amount={fmt(resources[k] ?? 0)} />
        ))}
      </div>
    </GrimPanel>
  )
}
