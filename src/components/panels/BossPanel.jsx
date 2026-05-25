import { useGameStore } from '../../store/gameStore'
import { GrimPanel, PanelHeader, Btn, ProgressBar, GrimDivider, SectionLabel, EmptyState, GrimBadge } from '../ui'
import { BOSSES, RESOURCES } from '../../utils/constants'
import { canAfford, fmt, fmtCost } from '../../utils/helpers'
import { clsx } from 'clsx'

const TIER_COLORS = ['','text-stone-400','text-red-400','text-purple-400','text-amber-300']

export default function BossPanel() {
  const { resources, summons, bossFight, stats, startBoss, fleeBoss } = useGameStore((s) => ({
    resources: s.resources, summons: s.summons, bossFight: s.bossFight,
    stats: s.stats, startBoss: s.startBoss, fleeBoss: s.fleeBoss,
  }))

  return (
    <GrimPanel className="h-full flex flex-col">
      <PanelHeader icon="⚔️" title="Bosse" subtitle="Herausforderungen des Dunkels" />
      <div className="grimPanel-body flex-1 space-y-4">

        {/* Active fight */}
        {bossFight && (
          <>
            <div className="statCard border border-blood/50 space-y-2">
              <div className="flex items-center gap-3">
                <span className="text-3xl animate-flicker">{bossFight.bossIcon}</span>
                <div className="flex-1">
                  <div className="font-display text-sm text-blood-light">{bossFight.bossName}</div>
                  <div className="font-mono text-xs text-ash">
                    {fmt(bossFight.currentHp)} / {fmt(bossFight.maxHp)} LP
                  </div>
                </div>
                <Btn onClick={fleeBoss} variant="danger">Fliehen</Btn>
              </div>
              <ProgressBar value={bossFight.currentHp} max={bossFight.maxHp} colorClass="bg-blood" />
              <div className="font-mono text-xs text-ash">
                {summons.length} Wesen kämpfen · ATK {fmt(summons.reduce((s,u) => s + u.stats.atk, 0))} · DEF {fmt(summons.reduce((s,u) => s + u.stats.def, 0))}
              </div>
            </div>
            <GrimDivider />
          </>
        )}

        {/* Boss list */}
        <SectionLabel>Herausforderungen</SectionLabel>
        {BOSSES.map((boss) => {
          const canChallenge = canAfford(resources, boss.unlockCost) && summons.length > 0 && !bossFight
          const fought = stats.bossKilled >= BOSSES.indexOf(boss) + 1

          return (
            <div key={boss.id} className={clsx(
              'statCard border space-y-2',
              bossFight?.bossId === boss.id ? 'border-blood/60' : 'border-ash-dark/30',
              !canAfford(resources, boss.unlockCost) && 'opacity-50'
            )}>
              <div className="flex items-start gap-2.5">
                <span className="text-2xl leading-none animate-flicker">{boss.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-display text-xs text-gold">{boss.name}</span>
                    <GrimBadge variant="blood">Tier {boss.tier}</GrimBadge>
                    {fought && <GrimBadge variant="green">✓ Besiegt</GrimBadge>}
                  </div>
                  <p className="font-body text-xs text-ash italic mt-0.5">{boss.desc}</p>
                  <div className="font-mono text-xs text-ash/60 mt-0.5">
                    LP: {fmt(boss.hp)} · ATK: {boss.atk} · DEF: {boss.def}
                  </div>
                  <div className="font-mono text-xs text-ash/50 mt-0.5">
                    Kosten: {fmtCost(boss.unlockCost)}
                  </div>
                  <div className="font-mono text-xs text-emerald-700 mt-0.5">
                    Belohnung: {Object.entries(boss.reward).map(([k,v]) => `${RESOURCES[k]?.icon ?? k} ${fmt(v)}`).join(' ')}
                  </div>
                </div>
                <Btn
                  onClick={() => startBoss(boss.id)}
                  disabled={!canChallenge}
                  variant={canChallenge ? 'blood' : 'ghost'}
                  className="shrink-0"
                >
                  {bossFight ? 'Aktiv' : 'Herausfordern'}
                </Btn>
              </div>
            </div>
          )
        })}

        {summons.length === 0 && (
          <p className="font-mono text-xs text-blood-dark/70 text-center">
            ⚠️ Beschwöre zuerst Wesen um Bosse herausfordern zu können.
          </p>
        )}
      </div>
    </GrimPanel>
  )
}
