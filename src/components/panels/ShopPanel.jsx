import { useGameStore } from '../../store/gameStore'
import { Panel, PanelHeader, Btn, StatCard, Divider, CostLine } from '../ui'
import { BUILDINGS } from '../../utils/constants'
import { fmt, canAfford } from '../../utils/helpers'

export default function ShopPanel() {
  const { buildings, gold, wood, buildOrUpgrade, stats } = useGameStore((s) => ({
    buildings: s.buildings, gold: s.gold, wood: s.materials.wood,
    buildOrUpgrade: s.buildOrUpgrade, stats: s.stats,
  }))
  const lvl = buildings.shop.level
  const def = BUILDINGS.shop
  const upCosts = def.upgradeCost(lvl + 1)
  const canUp = lvl < def.maxLevel && canAfford({ gold, materials: { wood } }, upCosts)

  return (
    <Panel>
      <PanelHeader icon="⚖️" title="Krämladen" level={lvl} />
      <div className="panel-body">
        <div className="grid grid-cols-2 gap-2">
          <StatCard label="Passive Einnahmen" value={`~${fmt(def.passiveGold(lvl))}/Tick`} />
          <StatCard label="Items verkauft" value={stats.itemsSold} />
        </div>
        <div className="bg-stone-800/30 rounded-lg p-3 border border-stone-700/20 text-sm font-body text-stone-400 italic leading-relaxed">
          Händler und Reisende kaufen hier ihre Waren. Passives Einkommen ohne weiteres Zutun.
        </div>
        <div className="flex gap-2">
          <Btn onClick={() => buildOrUpgrade('shop')} disabled={!canUp} className="flex-1">
            ⬆️ Auf Stufe {lvl + 1} upgraden
          </Btn>
        </div>
        {lvl < def.maxLevel && <CostLine costs={upCosts} />}
        <Divider />
        <div className="space-y-1">
          <p className="font-mono text-xs text-stone-500 uppercase tracking-wider">Einnahmen-Vorschau</p>
          {Array.from({ length: Math.min(lvl + 2, def.maxLevel) }, (_, i) => i + 1).map((l) => (
            <div key={l} className={`flex justify-between text-xs font-mono py-0.5 px-1 rounded ${l === lvl ? 'text-amber-300 bg-amber-950/30' : 'text-stone-600'}`}>
              <span>Stufe {l}</span>
              <span>{fmt(def.passiveGold(l))} Gold/Tick · {Math.round(def.passiveChance(l) * 10 * 1000) / 10}% Chance</span>
            </div>
          ))}
        </div>
      </div>
    </Panel>
  )
}
