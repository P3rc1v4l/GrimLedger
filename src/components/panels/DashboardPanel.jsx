import { useGameStore } from '../../store/gameStore'
import { GrimPanel, PanelHeader, ProgressBar, StatCard, GrimDivider } from '../ui'
import { RESOURCES } from '../../utils/constants'
import { fmt, fmtPlayTime } from '../../utils/helpers'
import { calcProductionRates } from '../../systems/production'

export default function DashboardPanel() {
  const state = useGameStore((s) => s)
  const { resources, player, stats, prestige, quests, bossFight } = state
  const rates = calcProductionRates(state)

  const xpPct = Math.min(100, (player.xp / player.xpToNext) * 100)
  const questsDone = [...quests.daily, ...quests.milestones].filter((q) => q.claimed).length
  const questsTotal = quests.daily.length + quests.milestones.length

  return (
    <GrimPanel className="h-full flex flex-col">
      <PanelHeader icon="📖" title="Das Grim Ledger" subtitle="Verfluchtes Archiv der verlorenen Seelen" />
      <div className="grimPanel-body flex-1">

        {/* Player */}
        <div className="statCard space-y-2">
          <div className="flex items-center justify-between">
            <div className="font-display text-xs text-gold tracking-wider">Archivar — Stufe {player.level}</div>
            <div className="font-mono text-xs text-ash">{fmt(player.xp)}/{fmt(player.xpToNext)} XP</div>
          </div>
          <ProgressBar value={player.xp} max={player.xpToNext} colorClass="bg-blood" />
        </div>

        {/* Key resources */}
        <div className="grid grid-cols-2 gap-2">
          {['seelen','knochen','blut','schatten','erinnerungen','asche','wissen','albtraeume'].map((k) => {
            const def = RESOURCES[k]
            return (
              <div key={k} className="statCard">
                <div className={`statLabel ${def.color} flex items-center gap-1`}>
                  <span>{def.icon}</span><span>{def.name}</span>
                </div>
                <div className="statValue text-[#c8b89a]">{fmt(resources[k] ?? 0)}</div>
              </div>
            )
          })}
        </div>

        {/* Rare resources */}
        {(resources.leereFragmente > 0 || resources.gottloseEssenz > 0 || resources.abyssMarken > 0) && (
          <>
            <GrimDivider />
            <div className="sectionLabel">Seltene Ressourcen</div>
            <div className="grid grid-cols-2 gap-2">
              {['leereFragmente','gottloseEssenz','abyssMarken'].filter((k) => resources[k] > 0).map((k) => {
                const def = RESOURCES[k]
                return (
                  <div key={k} className="statCard">
                    <div className={`statLabel ${def.color} flex items-center gap-1`}>
                      <span>{def.icon}</span><span>{def.name}</span>
                    </div>
                    <div className="statValue text-[#c8b89a]">{fmt(resources[k] ?? 0)}</div>
                  </div>
                )
              })}
            </div>
          </>
        )}

        <GrimDivider />

        {/* Stats summary */}
        <div className="grid grid-cols-3 gap-2">
          <StatCard label="Aufstieg" value={`#${prestige.count}`} color="text-gold" />
          <StatCard label="Quests"   value={`${questsDone}/${questsTotal}`} color="text-emerald-400" />
          <StatCard label="Spielzeit" value={fmtPlayTime(stats.totalPlayTime)} color="text-ash-light" />
        </div>

        {/* Active boss fight teaser */}
        {bossFight && (
          <>
            <GrimDivider />
            <div className="statCard space-y-1.5 border-blood/40">
              <div className="flex items-center gap-2">
                <span className="animate-flicker">{bossFight.bossIcon}</span>
                <div className="font-display text-xs text-blood-light">{bossFight.bossName}</div>
                <div className="font-mono text-xs text-ash ml-auto">{fmt(bossFight.currentHp)}/{fmt(bossFight.maxHp)} LP</div>
              </div>
              <ProgressBar value={bossFight.currentHp} max={bossFight.maxHp} colorClass="bg-blood" />
            </div>
          </>
        )}
      </div>
    </GrimPanel>
  )
}
