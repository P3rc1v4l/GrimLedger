import { useGameStore } from '../../store/gameStore'
import { Panel, PanelHeader, Btn, StatCard, EmptyState, Divider, CostLine } from '../ui'
import { BUILDINGS } from '../../utils/constants'
import { fmt, canAfford } from '../../utils/helpers'

export default function TavernPanel() {
  const { buildings, heroes, gold, wood, inviteHero, buildOrUpgrade } = useGameStore((s) => ({
    buildings: s.buildings, heroes: s.heroes, gold: s.gold,
    wood: s.materials.wood, inviteHero: s.inviteHero, buildOrUpgrade: s.buildOrUpgrade,
  }))
  const lvl = buildings.tavern.level
  const def = BUILDINGS.tavern
  const upCosts = def.upgradeCost(lvl + 1)
  const canUp = lvl < def.maxLevel && canAfford({ gold, materials: { wood } }, upCosts)

  return (
    <Panel id="tavern-panel">
      <PanelHeader icon="🍺" title="Taverne" level={lvl} />
      <div className="panel-body">
        <div className="grid grid-cols-2 gap-2">
          <StatCard label="Passive Einnahmen" value={`~${fmt(def.passiveGold(lvl))}/Tick`} />
          <StatCard label="Helden bewirtet" value={useGameStore((s) => s.stats.heroesServed)} />
        </div>
        <div className="flex gap-2">
          <Btn onClick={inviteHero} disabled={gold < 10} className="flex-1" id="btn-invite-hero">
            Held einladen (10 💰)
          </Btn>
          <Btn onClick={() => buildOrUpgrade('tavern')} disabled={!canUp} variant="ghost">
            ⬆️ Lvl {lvl + 1}
          </Btn>
        </div>
        {lvl < def.maxLevel && <CostLine costs={upCosts} />}
        <Divider />
        {heroes.length === 0
          ? <EmptyState icon="🍺" text="Lade einen Helden ein! (10 Gold)" />
          : (
            <div className="space-y-2">
              <p className="font-mono text-xs text-stone-500 uppercase tracking-wider">Aktuelle Gäste</p>
              {heroes.slice(0, 6).map((h) => (
                <div key={h.id} className="flex items-center gap-2 bg-stone-800/40 rounded-lg px-2.5 py-2 border border-stone-700/20">
                  <span className="text-lg leading-none">{h.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-body text-stone-200 truncate">{h.name}</div>
                    <div className={`text-xs font-mono ${h.color}`}>{h.class} · Lvl {h.level}</div>
                  </div>
                  <div className="text-xs font-mono text-amber-400 shrink-0">+{h.goldSpent} 💰</div>
                </div>
              ))}
            </div>
          )
        }
      </div>
    </Panel>
  )
}
