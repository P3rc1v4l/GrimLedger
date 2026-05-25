import { useGameStore } from '../../store/gameStore'
import { GrimPanel, PanelHeader, Btn, ProgressBar, GrimDivider, SectionLabel, GrimBadge } from '../ui'
import { RESOURCES } from '../../utils/constants'
import { fmt } from '../../utils/helpers'
import { clsx } from 'clsx'

export default function QuestPanel() {
  const { quests, claimQuest } = useGameStore((s) => ({ quests: s.quests, claimQuest: s.claimQuest }))
  const { daily, milestones, lastRefresh } = quests

  const msLeft = Math.max(0, lastRefresh + 86_400_000 - Date.now())
  const h = Math.floor(msLeft / 3_600_000)
  const m = Math.floor((msLeft % 3_600_000) / 60_000)

  return (
    <GrimPanel className="h-full flex flex-col">
      <PanelHeader icon="🎯" title="Quests" subtitle={`Tagesquests — Reset in ${h}h ${m}m`} />
      <div className="grimPanel-body flex-1 space-y-4">

        <SectionLabel>Tagesquests</SectionLabel>
        {daily.map((q) => <QuestCard key={q.id} quest={q} onClaim={() => claimQuest(q.id, 'daily')} />)}

        <GrimDivider />

        <SectionLabel>Meilensteine</SectionLabel>
        {milestones.map((q) => <QuestCard key={q.id} quest={q} onClaim={() => claimQuest(q.id, 'milestones')} />)}
      </div>
    </GrimPanel>
  )
}

function QuestCard({ quest, onClaim }) {
  const { completed, claimed, title, desc, progress, goal, reward } = quest
  const pct = goal > 0 ? Math.min(1, (progress ?? 0) / goal) : 0

  return (
    <div className={clsx(
      'statCard border space-y-2',
      claimed   ? 'border-ash-dark/20 opacity-40'
      : completed ? 'border-emerald-800/50'
      :             'border-blood-dark/30'
    )}>
      <div className="flex items-start gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-display text-xs text-gold">{title}</span>
            {claimed   && <GrimBadge variant="default">Kassiert</GrimBadge>}
            {completed && !claimed && <GrimBadge variant="green">✓ Abgeschlossen!</GrimBadge>}
          </div>
          <p className="font-body text-xs text-ash italic mt-0.5">{desc}</p>
        </div>
        {completed && !claimed && (
          <Btn onClick={onClaim} variant="gold" className="shrink-0">Kassieren</Btn>
        )}
      </div>

      {!claimed && (
        <div className="space-y-1">
          <div className="flex justify-between font-mono text-xs text-ash">
            <span>Fortschritt</span>
            <span>{Math.min(progress ?? 0, goal)}/{goal}</span>
          </div>
          <ProgressBar value={progress ?? 0} max={goal}
            colorClass={completed ? 'bg-emerald-700' : 'bg-blood-dark'} />
        </div>
      )}

      <div className="flex items-center gap-1.5 flex-wrap">
        <span className="font-mono text-xs text-ash/60">Belohnung:</span>
        {Object.entries(reward).map(([k, v]) => {
          const def = RESOURCES[k]
          return (
            <GrimBadge key={k} variant="default" className={def?.color}>
              {def?.icon ?? k} {fmt(v)}
            </GrimBadge>
          )
        })}
      </div>
    </div>
  )
}
