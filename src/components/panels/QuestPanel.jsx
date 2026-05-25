import { useGameStore } from '../../store/gameStore'
import { Panel, PanelHeader, Btn, Divider, Badge } from '../ui'
import { fmtCost, fmt } from '../../utils/helpers'
import { clsx } from 'clsx'

export default function QuestPanel() {
  const { quests, claimQuest } = useGameStore((s) => ({
    quests: s.quests,
    claimQuest: s.claimQuest,
  }))

  const { active, lastRefresh, totalCompleted, totalClaimed } = quests

  // Time until next refresh (midnight)
  const now = Date.now()
  const todayStart = lastRefresh
  const nextRefresh = todayStart + 24 * 60 * 60 * 1000
  const msLeft = Math.max(0, nextRefresh - now)
  const hLeft  = Math.floor(msLeft / 3_600_000)
  const mLeft  = Math.floor((msLeft % 3_600_000) / 60_000)
  const timeLabel = `${hLeft}h ${mLeft}m`

  const completedCount = active.filter((q) => q.completed).length
  const claimedCount   = active.filter((q) => q.claimed).length

  return (
    <Panel>
      <PanelHeader icon="🎯" title="Tagesquests" />
      <div className="panel-body">

        {/* Header info */}
        <div className="grid grid-cols-3 gap-2">
          <div className="stat-card">
            <div className="stat-label">Heute</div>
            <div className="stat-value text-amber-300">{claimedCount}/{active.length} kassiert</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Nächste Quests</div>
            <div className="stat-value text-stone-400">{timeLabel}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Gesamt</div>
            <div className="stat-value text-amber-300">{totalClaimed} abgeschlossen</div>
          </div>
        </div>

        <Divider />

        {/* Quest list */}
        <div className="space-y-3">
          {active.map((quest) => (
            <QuestCard key={quest.id} quest={quest} onClaim={() => claimQuest(quest.id)} />
          ))}
        </div>

        <Divider />

        {/* Hint */}
        <p className="text-xs text-stone-600 font-body italic text-center">
          Quests werden jeden Tag um Mitternacht erneuert.
        </p>
      </div>
    </Panel>
  )
}

function QuestCard({ quest, onClaim }) {
  const isMixed    = !!quest.conditions
  const isComplete = quest.completed
  const isClaimed  = quest.claimed

  // Compute overall progress fraction for the progress bar
  let progressFraction = 0
  if (isMixed) {
    const total = quest.conditions.reduce((s, c) => s + c.goal, 0)
    const done  = quest.conditions.reduce((s, c, i) => s + Math.min(c.goal, quest.conditionProgress?.[i] ?? 0), 0)
    progressFraction = total > 0 ? done / total : 0
  } else {
    progressFraction = quest.goal > 0 ? Math.min(1, (quest.progress ?? 0) / quest.goal) : 0
  }

  const barColor = isClaimed ? 'bg-stone-600' : isComplete ? 'bg-emerald-500' : 'bg-amber-600'

  return (
    <div className={clsx(
      'rounded-xl border p-3 space-y-2.5 transition-all duration-300',
      isClaimed   ? 'bg-stone-900/30 border-stone-700/20 opacity-50'
      : isComplete ? 'bg-emerald-950/30 border-emerald-700/40'
      :              'bg-stone-800/40 border-stone-700/20'
    )}>
      {/* Title row */}
      <div className="flex items-start gap-2.5">
        <span className="text-2xl leading-none mt-0.5">{quest.icon}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-display text-sm text-stone-100">{quest.title}</span>
            {isClaimed && <Badge variant="default">Kassiert</Badge>}
            {isComplete && !isClaimed && <Badge variant="green">Abschlossen! ✓</Badge>}
            <Badge variant={
              quest.category === 'tavern' ? 'gold' :
              quest.category === 'forge'  ? 'default' :
              quest.category === 'dungeon'? 'red' :
              quest.category === 'crypt'  ? 'violet' : 'blue'
            }>
              {quest.category}
            </Badge>
          </div>
          <p className="text-xs text-stone-400 font-body mt-0.5">{quest.description}</p>
        </div>
      </div>

      {/* Progress */}
      {!isClaimed && (
        <>
          <div className="space-y-1">
            {isMixed ? (
              // Show each condition separately
              quest.conditions.map((cond, i) => {
                const prog = quest.conditionProgress?.[i] ?? 0
                const frac = Math.min(1, prog / cond.goal)
                return (
                  <div key={i} className="space-y-0.5">
                    <div className="flex justify-between font-mono text-xs text-stone-500">
                      <span>{cond.label}</span>
                      <span className={prog >= cond.goal ? 'text-emerald-400' : 'text-stone-400'}>
                        {prog}/{cond.goal} {prog >= cond.goal ? '✓' : ''}
                      </span>
                    </div>
                    <div className="progress-track h-1">
                      <div
                        className={clsx('progress-fill h-full', prog >= cond.goal ? 'bg-emerald-500' : 'bg-amber-700')}
                        style={{ width: `${frac * 100}%` }}
                      />
                    </div>
                  </div>
                )
              })
            ) : (
              // Single progress bar
              <div className="space-y-0.5">
                <div className="flex justify-between font-mono text-xs text-stone-500">
                  <span>Fortschritt</span>
                  <span className={isComplete ? 'text-emerald-400' : 'text-stone-400'}>
                    {Math.min(quest.progress ?? 0, quest.goal)}/{quest.goal}
                  </span>
                </div>
                <div className="progress-track">
                  <div className={clsx('progress-fill', barColor)} style={{ width: `${progressFraction * 100}%` }} />
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* Reward + Claim */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="font-mono text-xs text-stone-500">Belohnung:</span>
          {quest.reward.gold     && <Badge variant="gold">{fmt(quest.reward.gold)} 💰</Badge>}
          {quest.reward.xp       && <Badge variant="blue">{quest.reward.xp} XP</Badge>}
          {quest.reward.souls    && <Badge variant="violet">{quest.reward.souls} Seelen</Badge>}
          {quest.reward.materials && Object.entries(quest.reward.materials).map(([k, v]) => (
            <Badge key={k} variant="default">{v} {k === 'iron' ? '⚙️' : k === 'wood' ? '🪵' : k === 'bones' ? '🦴' : k}</Badge>
          ))}
        </div>
        {isComplete && !isClaimed && (
          <Btn onClick={onClaim} variant="success" className="shrink-0">
            Kassieren!
          </Btn>
        )}
        {isClaimed && (
          <span className="font-mono text-xs text-stone-600">✓</span>
        )}
      </div>
    </div>
  )
}
