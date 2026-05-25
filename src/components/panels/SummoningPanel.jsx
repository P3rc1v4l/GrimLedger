import { useGameStore } from '../../store/gameStore'
import { GrimPanel, PanelHeader, Btn, EmptyState, GrimDivider, SectionLabel, ProgressBar } from '../ui'
import { SUMMONS, RESEARCH } from '../../utils/constants'
import { canAfford, fmtCost } from '../../utils/helpers'
import { clsx } from 'clsx'

const TIER_COLORS = ['', 'text-stone-400', 'text-red-400', 'text-purple-400', 'text-amber-300']

export default function SummoningPanel() {
  const { resources, researchDone, summons, summon: doSummon, dismissSummon } = useGameStore((s) => ({
    resources: s.resources,
    researchDone: s.researchDone,
    summons: s.summons,
    summon: s.summon,
    dismissSummon: s.dismissSummon,
  }))

  const summonUnlocked = researchDone.includes('ersteBeschwoerung')
  const costMult = researchDone.includes('dunklePakte') ? 0.7 : 1.0

  return (
    <GrimPanel className="h-full flex flex-col">
      <PanelHeader icon="🔮" title="Beschwörung" subtitle="Rufe Wesen aus dem Jenseits" />
      <div className="grimPanel-body flex-1 space-y-4">

        {!summonUnlocked && (
          <div className="statCard border border-ash-dark/30 text-center space-y-2 py-6">
            <div className="text-3xl opacity-20 animate-runeGlow">🔮</div>
            <p className="font-body text-ash italic text-sm">Erforsche "Erste Beschwörung" um Wesen zu beschwören.</p>
          </div>
        )}

        {/* Summon catalog */}
        <div className="space-y-2">
          <SectionLabel>Verfügbare Wesen</SectionLabel>
          {Object.entries(SUMMONS).map(([id, def]) => {
            const prereqsMet  = (def.requires ?? []).every((r) => researchDone.includes(r))
            const effectiveCost = Object.fromEntries(Object.entries(def.cost).map(([k, v]) => [k, Math.floor(v * costMult)]))
            const affordable   = canAfford(resources, effectiveCost)
            const available    = summonUnlocked && prereqsMet

            return (
              <div key={id} className={clsx(
                'statCard border space-y-1.5',
                available ? 'border-blood-dark/40' : 'border-ash-dark/20 opacity-40'
              )}>
                <div className="flex items-start gap-2.5">
                  <span className={clsx('text-2xl leading-none mt-0.5', available && 'animate-flicker')}>{def.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-display text-xs text-gold">{def.name}</span>
                      <span className={clsx('font-mono text-xs', TIER_COLORS[def.tier])}>Tier {def.tier}</span>
                    </div>
                    <p className="font-body text-xs text-ash italic mt-0.5">{def.desc}</p>
                    <div className="font-mono text-xs text-ash/60 mt-0.5">
                      {fmtCost(effectiveCost)}
                      {costMult < 1 && <span className="text-emerald-500 ml-1">(-30%)</span>}
                    </div>
                    <div className="font-mono text-xs text-ash/50 mt-0.5">
                      LP:{def.stats.hp} · ATK:{def.stats.atk} · DEF:{def.stats.def} · Krit:{Math.round(def.stats.crit*100)}%
                    </div>
                    {!prereqsMet && (
                      <div className="font-mono text-xs text-blood-dark/70 mt-0.5">
                        Benötigt: {def.requires.map((r) => RESEARCH[r]?.name ?? r).join(', ')}
                      </div>
                    )}
                  </div>
                  <Btn
                    onClick={() => doSummon(id)}
                    disabled={!available || !affordable}
                    variant={available && affordable ? 'blood' : 'ghost'}
                    className="shrink-0"
                  >
                    Beschwören
                  </Btn>
                </div>
              </div>
            )
          })}
        </div>

        {/* Active summons */}
        {summons.length > 0 && (
          <>
            <GrimDivider />
            <SectionLabel>Aktive Wesen ({summons.length})</SectionLabel>
            <div className="space-y-2">
              {summons.map((s) => (
                <div key={s.instanceId} className="statCard border border-blood-dark/30 space-y-1.5 group">
                  <div className="flex items-center gap-2">
                    <span className="text-lg animate-flicker">{s.icon}</span>
                    <div className="flex-1">
                      <div className="font-display text-xs text-gold">{s.name}</div>
                    </div>
                    <div className="font-mono text-xs text-ash">
                      LP {s.currentHp ?? s.stats.hp}/{s.stats.hp}
                    </div>
                    <button
                      onClick={() => dismissSummon(s.instanceId)}
                      className="opacity-0 group-hover:opacity-100 font-mono text-xs text-blood-dark hover:text-blood-light transition-all"
                    >✕</button>
                  </div>
                  <ProgressBar
                    value={s.currentHp ?? s.stats.hp}
                    max={s.stats.hp}
                    colorClass="bg-blood-dark"
                  />
                </div>
              ))}
            </div>
          </>
        )}

        {summons.length === 0 && summonUnlocked && (
          <EmptyState icon="💀" text="Keine Wesen beschworen. Beschwöre Wesen um Bosse herausfordern zu können." />
        )}
      </div>
    </GrimPanel>
  )
}
