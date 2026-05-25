import { useState, useEffect } from 'react'
import { useGameStore } from '../../store/gameStore'
import { Panel, PanelHeader, Btn, EmptyState, Divider, CostLine, Badge } from '../ui'
import { BUILDINGS } from '../../utils/constants'
import { canAfford, fmt, fmtTime } from '../../utils/helpers'

export default function DungeonPanel() {
  const { buildings, dungeonRuns, gold, materials, souls, startRun, buildOrUpgrade } = useGameStore((s) => ({
    buildings: s.buildings, dungeonRuns: s.dungeonRuns, gold: s.gold,
    materials: s.materials, souls: s.souls, startRun: s.startRun, buildOrUpgrade: s.buildOrUpgrade,
  }))
  const [now, setNow] = useState(Date.now())
  useEffect(() => { const id = setInterval(() => setNow(Date.now()), 250); return () => clearInterval(id) }, [])

  const state = { gold, materials, souls }
  const def = BUILDINGS.dungeon
  const lvl = buildings.dungeon.level

  if (lvl === 0) {
    const cost = def.unlockCost
    return (
      <Panel id="dungeon-panel">
        <PanelHeader icon="⛓️" title="Verlies" />
        <div className="panel-body">
          <EmptyState icon="🕳️" text="Das Dunkel wartet auf seinen Herrn..." />
          <Btn onClick={() => buildOrUpgrade('dungeon')} disabled={!canAfford(state, cost)} className="w-full justify-center">
            🏗️ Verlies öffnen
          </Btn>
          <CostLine costs={cost} />
        </div>
      </Panel>
    )
  }

  const max = def.maxRuns(lvl)
  const dur = def.runDuration(lvl)
  const rng = def.rewardGold(lvl)
  const upCosts = def.upgradeCost(lvl + 1)

  return (
    <Panel id="dungeon-panel">
      <PanelHeader icon="⛓️" title="Verlies" level={lvl} />
      <div className="panel-body">
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: 'Aktive Runs', value: `${dungeonRuns.length}/${max}` },
            { label: 'Dauer', value: fmtTime(dur) },
            { label: 'Belohnung', value: `${fmt(rng.min)}–${fmt(rng.max)}💰` },
          ].map(({ label, value }) => (
            <div key={label} className="stat-card">
              <div className="stat-label">{label}</div>
              <div className="stat-value text-amber-300 truncate">{value}</div>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <Btn onClick={startRun} disabled={dungeonRuns.length >= max} className="flex-1">
            ⚔️ Expedition starten
          </Btn>
          <Btn onClick={() => buildOrUpgrade('dungeon')} disabled={lvl >= def.maxLevel || !canAfford(state, upCosts)} variant="ghost">
            ⬆️ Lvl {lvl + 1}
          </Btn>
        </div>
        {lvl < def.maxLevel && <CostLine costs={upCosts} />}
        <Divider />
        {dungeonRuns.length === 0
          ? <EmptyState icon="⚔️" text="Keine aktiven Expeditionen." />
          : (
            <div className="space-y-2">
              <p className="font-mono text-xs text-stone-500 uppercase tracking-wider">Aktive Expeditionen</p>
              {dungeonRuns.map((run) => {
                const elapsed = now - run.startTime
                const pct = Math.min(1, elapsed / run.duration)
                const remaining = Math.max(0, run.duration - elapsed)
                return (
                  <div key={run.id} className="bg-stone-800/50 rounded-lg p-3 border border-stone-700/30 space-y-2">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <span className="font-mono text-xs text-stone-300 animate-shimmer">⚔️ Verlies Stufe {run.level}</span>
                      <div className="flex gap-1 flex-wrap">
                        <Badge variant="gold">+{fmt(run.reward.gold)} 💰</Badge>
                        <Badge variant="blue">+{run.reward.xp} XP</Badge>
                        {run.reward.bones > 0 && <Badge>+{run.reward.bones} 🦴</Badge>}
                      </div>
                    </div>
                    <div className="progress-track">
                      <div className="progress-fill bg-red-700" style={{ width: `${pct * 100}%` }} />
                    </div>
                    <div className="flex justify-between font-mono text-xs text-stone-600">
                      <span>{Math.round(pct * 100)}%</span>
                      <span>{fmtTime(remaining)} verbleibend</span>
                    </div>
                  </div>
                )
              })}
            </div>
          )
        }
      </div>
    </Panel>
  )
}
