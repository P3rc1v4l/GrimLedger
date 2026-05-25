import { useGameStore } from '../../store/gameStore'
import { Panel, PanelHeader, Btn, EmptyState, Divider, CostLine } from '../ui'
import { BUILDINGS } from '../../utils/constants'
import { canAfford, fmt } from '../../utils/helpers'

export default function CryptPanel() {
  const { buildings, undead, gold, materials, souls, raiseSkeleton, dismissUndead, buildOrUpgrade } = useGameStore((s) => ({
    buildings: s.buildings, undead: s.undead, gold: s.gold,
    materials: s.materials, souls: s.souls,
    raiseSkeleton: s.raiseSkeleton, dismissUndead: s.dismissUndead,
    buildOrUpgrade: s.buildOrUpgrade,
  }))
  const state = { gold, materials, souls }
  const def = BUILDINGS.crypt
  const lvl = buildings.crypt.level

  if (lvl === 0) {
    const cost = def.unlockCost
    return (
      <Panel id="crypt-panel">
        <PanelHeader icon="💀" title="Gruft des Nekromanten" />
        <div className="panel-body">
          <EmptyState icon="⚰️" text="Die Toten ruhen noch ungestört..." />
          <Btn onClick={() => buildOrUpgrade('crypt')} disabled={!canAfford(state, cost)} className="w-full justify-center">
            🏗️ Gruft errichten
          </Btn>
          <CostLine costs={cost} />
        </div>
      </Panel>
    )
  }

  const max = def.maxUndead(lvl)
  const upCosts = def.upgradeCost(lvl + 1)
  const canRaise = souls >= 5 && (materials.bones ?? 0) >= 3 && undead.length < max

  return (
    <Panel id="crypt-panel">
      <PanelHeader icon="💀" title="Gruft des Nekromanten" level={lvl} />
      <div className="panel-body">
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: 'Diener', value: `${undead.length}/${max}`, color: 'text-purple-300' },
            { label: 'Seelen', value: souls, color: 'text-purple-300' },
            { label: 'Knochen', value: materials.bones ?? 0, color: 'text-stone-300' },
          ].map(({ label, value, color }) => (
            <div key={label} className="stat-card">
              <div className="stat-label">{label}</div>
              <div className={`stat-value ${color}`}>{value}</div>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <Btn onClick={raiseSkeleton} disabled={!canRaise} className="flex-1">
            💀 Skelett beschwören
          </Btn>
          <Btn onClick={() => buildOrUpgrade('crypt')} disabled={lvl >= def.maxLevel || !canAfford(state, upCosts)} variant="ghost">
            ⬆️ Lvl {lvl + 1}
          </Btn>
        </div>
        <p className="font-mono text-xs text-stone-600">Kosten: 5 💀 Seelen · 3 🦴 Knochen</p>
        {lvl < def.maxLevel && <CostLine costs={upCosts} />}
        <Divider />
        {undead.length === 0
          ? <EmptyState icon="💀" text="Keine Diener. Sammle Seelen durch Verlies-Expeditionen." />
          : (
            <div className="space-y-1">
              <p className="font-mono text-xs text-stone-500 uppercase tracking-wider">Untote Diener ({undead.length}/{max})</p>
              <div className="grid grid-cols-2 gap-1.5">
                {undead.map((sk) => (
                  <div key={sk.id} className="flex items-center gap-1.5 bg-stone-800/40 rounded-lg px-2 py-1.5 border border-stone-700/20 group">
                    <span className="text-sm">💀</span>
                    <div className="flex-1 min-w-0">
                      <div className="font-mono text-xs text-stone-300 truncate">{sk.name}</div>
                      <div className="font-mono text-xs text-stone-600">Lvl {sk.level}</div>
                    </div>
                    <button onClick={() => dismissUndead(sk.id)} className="opacity-0 group-hover:opacity-100 text-xs text-red-700 hover:text-red-500 transition-all font-mono" title="Entlassen">✕</button>
                  </div>
                ))}
              </div>
            </div>
          )
        }
      </div>
    </Panel>
  )
}
