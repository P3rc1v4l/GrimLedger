import { useGameStore } from '../../store/gameStore'
import { Panel, PanelHeader, Divider } from '../ui'
import { clsx } from 'clsx'
import { fmt } from '../../utils/helpers'

const TYPE_COLOR = {
  gold:     'border-amber-700 text-amber-400',
  upgrade:  'border-emerald-700 text-emerald-300',
  dungeon:  'border-red-800 text-red-300',
  craft:    'border-orange-700 text-orange-300',
  undead:   'border-purple-800 text-purple-300',
  tip:      'border-blue-800 text-blue-300',
  system:   'border-stone-600 text-stone-400',
  normal:   'border-stone-700 text-stone-500',
  prestige: 'border-violet-600 text-violet-300',
  quest:    'border-emerald-600 text-emerald-300',
}

export default function LogPanel() {
  const { log, stats, prestige } = useGameStore((s) => ({
    log: s.log, stats: s.stats, prestige: s.prestige,
  }))

  return (
    <Panel>
      <PanelHeader icon="📜" title="Chronik des Bollwerks" />
      <div className="panel-body">
        <div className="grid grid-cols-2 gap-2">
          {[
            { label: 'Helden bewirtet', value: stats.heroesServed },
            { label: 'Items geschmiedet', value: stats.itemsCrafted },
            { label: 'Skelette beschworen', value: stats.skeletonsSummoned },
            { label: 'Expeditionen', value: stats.runsCompleted },
            { label: 'Prestige-Runs', value: prestige.count },
            { label: 'Gold verdient', value: `${fmt(stats.totalGoldEarned)} 💰` },
          ].map(({ label, value }) => (
            <div key={label} className="flex justify-between items-center bg-stone-800/30 rounded px-2 py-1 border border-stone-700/20">
              <span className="font-mono text-xs text-stone-500">{label}</span>
              <span className="font-mono text-xs text-amber-300">{value}</span>
            </div>
          ))}
        </div>

        <Divider />

        <div className="space-y-0.5 max-h-80 overflow-y-auto pr-1">
          {log.map((entry) => (
            <div key={entry.id} className={clsx('log-entry', TYPE_COLOR[entry.type] ?? TYPE_COLOR.normal)}>
              {entry.msg}
            </div>
          ))}
        </div>
      </div>
    </Panel>
  )
}
