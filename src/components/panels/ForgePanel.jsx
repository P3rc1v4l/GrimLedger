import { useGameStore } from '../../store/gameStore'
import { Panel, PanelHeader, Btn, EmptyState, Divider, CostLine, Badge } from '../ui'
import { BUILDINGS, RECIPES } from '../../utils/constants'
import { canAfford, fmtCost, fmt } from '../../utils/helpers'

export default function ForgePanel() {
  const { buildings, inventory, gold, materials, souls, craftItem, sellItem, sellAll, buildOrUpgrade } = useGameStore((s) => ({
    buildings: s.buildings, inventory: s.inventory, gold: s.gold,
    materials: s.materials, souls: s.souls,
    craftItem: s.craftItem, sellItem: s.sellItem, sellAll: s.sellAll,
    buildOrUpgrade: s.buildOrUpgrade,
  }))
  const state = { gold, materials, souls }
  const def = BUILDINGS.forge
  const lvl = buildings.forge.level

  if (lvl === 0) {
    const cost = def.unlockCost
    return (
      <Panel id="forge-panel">
        <PanelHeader icon="⚒️" title="Schmiede" />
        <div className="panel-body">
          <EmptyState icon="🔥" text="Kein Feuer brennt hier noch..." />
          <Btn onClick={() => buildOrUpgrade('forge')} disabled={!canAfford(state, cost)} className="w-full justify-center">
            🏗️ Schmiede bauen
          </Btn>
          <CostLine costs={cost} />
        </div>
      </Panel>
    )
  }

  const upCosts = def.upgradeCost(lvl + 1)
  return (
    <Panel id="forge-panel">
      <PanelHeader icon="⚒️" title="Schmiede" level={lvl} />
      <div className="panel-body">
        <div className="flex items-center justify-between gap-2">
          <div className="stat-card flex-1">
            <div className="stat-label">Wert-Bonus</div>
            <div className="stat-value text-amber-300">+{Math.round(def.craftBonus(lvl) * 100)}%</div>
          </div>
          <Btn onClick={() => buildOrUpgrade('forge')} disabled={lvl >= def.maxLevel || !canAfford(state, upCosts)} variant="ghost">
            ⬆️ Lvl {lvl + 1}
          </Btn>
        </div>
        {lvl < def.maxLevel && <CostLine costs={upCosts} />}

        <Divider />
        <p className="font-mono text-xs text-stone-500 uppercase tracking-wider">Rezepte</p>
        <div className="space-y-2">
          {Object.entries(RECIPES).map(([id, r]) => {
            const unlocked = lvl >= r.reqLevel
            const value = Math.floor(r.baseValue * (1 + def.craftBonus(lvl)))
            const bonusStr = Object.entries(r.bonus).map(([k, v]) => `+${v} ${k}`).join(', ')
            return (
              <div key={id} className={`bg-stone-800/40 rounded-lg p-2.5 border border-stone-700/20 space-y-1.5 ${!unlocked ? 'opacity-40' : ''}`}>
                <div className="flex items-start gap-2">
                  <span className="text-xl leading-none mt-0.5">{r.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-sm font-body text-stone-200">{r.name}</span>
                      <Badge variant="gold">{fmt(value)} 💰</Badge>
                    </div>
                    {bonusStr && <div className="text-xs text-emerald-500 font-mono">{bonusStr}</div>}
                    <div className="text-xs text-stone-500 font-mono">{fmtCost(r.cost)}</div>
                    {!unlocked && <div className="text-xs text-red-500 font-mono">🔒 Schmiede Lvl {r.reqLevel}</div>}
                  </div>
                  <Btn onClick={() => craftItem(id)} disabled={!unlocked || !canAfford(state, r.cost)} className="shrink-0">
                    Schmieden
                  </Btn>
                </div>
              </div>
            )
          })}
        </div>

        {inventory.length > 0 && (
          <>
            <Divider />
            <div className="flex items-center justify-between">
              <p className="font-mono text-xs text-stone-500 uppercase tracking-wider">Inventar ({inventory.length})</p>
              <Btn onClick={sellAll} variant="ghost" className="text-xs">Alles verkaufen</Btn>
            </div>
            <div className="space-y-1.5">
              {inventory.map((item) => (
                <div key={item.id} className="flex items-center gap-2 bg-stone-800/30 rounded-lg px-2.5 py-1.5">
                  <span className="text-base">{item.icon}</span>
                  <span className="text-sm font-body text-stone-200 flex-1 truncate">{item.name}</span>
                  <Btn onClick={() => sellItem(item.id)} variant="ghost" className="text-xs shrink-0">{fmt(item.value)} 💰</Btn>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </Panel>
  )
}
