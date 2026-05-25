import { useGameStore } from '../../store/gameStore'
import { GrimPanel, PanelHeader, Btn, GrimDivider, SectionLabel, ProgressBar, EmptyState } from '../ui'
import { BUILDINGS, RESOURCES } from '../../utils/constants'
import { canAfford, fmt, fmtCost } from '../../utils/helpers'
import { calcProductionRates } from '../../systems/production'

export default function BuildingsPanel() {
  const state = useGameStore((s) => s)
  const { resources, buildings, researchDone, buildOrUpgrade } = state
  const rates = calcProductionRates(state)

  const built    = Object.entries(BUILDINGS).filter(([, def]) => (buildings[def.name]?.level ?? 0) > 0 || !def.unlockCost || canAfford(resources, def.unlockCost))
  const locked   = Object.entries(BUILDINGS).filter(([, def]) => !canAfford(resources, def.unlockCost ?? {}) && (buildings[def.name]?.level ?? 0) === 0)

  return (
    <GrimPanel className="h-full flex flex-col">
      <PanelHeader icon="🏛️" title="Gebäude" subtitle="Errichte Stätten der Dunkelheit" />
      <div className="grimPanel-body flex-1 space-y-3">
        {Object.entries(BUILDINGS).map(([id, def]) => {
          const lvl  = buildings[id]?.level ?? 0
          const isNew = lvl === 0
          const costs = isNew ? (def.unlockCost ?? {}) : def.upgradeCost(lvl + 1)
          const canBuy = canAfford(resources, costs)
          const maxed  = lvl >= def.maxLevel

          // Calc production for this building
          const prod = lvl > 0 ? def.produces(lvl) : null
          const prodStr = prod ? Object.entries(prod)
            .map(([k, v]) => `${RESOURCES[k]?.icon ?? k} ${fmt(v)}/s`)
            .join('  ') : null

          return (
            <div key={id} className={`statCard space-y-2 border ${lvl > 0 ? 'border-blood-dark/40' : 'border-ash-dark/20 opacity-60'}`}>
              <div className="flex items-start gap-2.5">
                <span className={`text-2xl leading-none mt-0.5 ${lvl > 0 ? 'animate-flicker' : 'opacity-40'}`}>{def.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-display text-sm text-gold tracking-wide">{def.name}</span>
                    {lvl > 0 && <span className="font-mono text-xs text-ash">Stufe {lvl}/{def.maxLevel}</span>}
                  </div>
                  <p className="font-body text-xs text-ash italic mt-0.5">{def.desc}</p>
                  {prodStr && <div className="font-mono text-xs text-blood-dark/80 mt-0.5">{prodStr}</div>}
                </div>
                <Btn
                  onClick={() => buildOrUpgrade(id)}
                  disabled={maxed || !canBuy}
                  variant={canBuy && !maxed ? 'blood' : 'ghost'}
                  className="shrink-0"
                >
                  {maxed ? 'Max' : isNew ? '🏗️ Bauen' : '⬆️ Upgrade'}
                </Btn>
              </div>
              {lvl > 0 && (
                <ProgressBar value={lvl} max={def.maxLevel} colorClass="bg-blood-dark" />
              )}
              {!maxed && (
                <div className="font-mono text-xs text-ash/70">{fmtCost(costs)}</div>
              )}
            </div>
          )
        })}
      </div>
    </GrimPanel>
  )
}
