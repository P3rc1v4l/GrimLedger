import { useGameStore } from '../../store/gameStore'
import { GrimPanel, PanelHeader, Btn, GrimDivider, SectionLabel } from '../ui'
import { RESEARCH } from '../../utils/constants'
import { canAfford, fmtCost } from '../../utils/helpers'
import { clsx } from 'clsx'

const PATH_LABELS = {
  produktion:    { label: 'Produktion',    icon: '⚙️', color: 'text-amber-400',  border: 'border-amber-800/50' },
  beschwoerung:  { label: 'Beschwörung',   icon: '🔮', color: 'text-purple-400', border: 'border-purple-800/50' },
  korrumpierung: { label: 'Korrumpierung', icon: '💫', color: 'text-cyan-400',   border: 'border-cyan-800/50' },
}

export default function ResearchPanel() {
  const { resources, researchDone, research: doResearch } = useGameStore((s) => ({
    resources: s.resources,
    researchDone: s.researchDone,
    research: s.research,
  }))

  const byPath = {}
  for (const [id, def] of Object.entries(RESEARCH)) {
    if (!byPath[def.path]) byPath[def.path] = []
    byPath[def.path].push({ id, ...def })
  }

  return (
    <GrimPanel className="h-full flex flex-col">
      <PanelHeader icon="📜" title="Forschung" subtitle="Erforsche dunkle Rituale und Technologien" />
      <div className="grimPanel-body flex-1 space-y-4">
        {Object.entries(byPath).map(([path, items]) => {
          const meta = PATH_LABELS[path]
          return (
            <div key={path}>
              <div className={clsx('flex items-center gap-2 mb-2', meta.color)}>
                <span>{meta.icon}</span>
                <span className="font-display text-xs tracking-widest uppercase">{meta.label}</span>
                <div className="flex-1 border-t border-current/20" />
              </div>
              <div className="space-y-2">
                {items.map((item) => {
                  const done = researchDone.includes(item.id)
                  const prereqsMet = (item.requires ?? []).every((r) => researchDone.includes(r))
                  const affordable = canAfford(resources, item.cost)
                  const available  = prereqsMet && !done

                  return (
                    <div key={item.id} className={clsx(
                      'statCard border space-y-1.5',
                      done      ? 'border-emerald-900/40 opacity-60'
                      : available ? `${meta.border} bg-void/50`
                      :             'border-ash-dark/20 opacity-40'
                    )}>
                      <div className="flex items-start gap-2">
                        <span className={clsx('text-xl leading-none mt-0.5', done && 'opacity-50')}>{item.icon}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-display text-xs text-gold tracking-wide">{item.name}</span>
                            {done && <span className="font-mono text-xs text-emerald-500">✓ erforscht</span>}
                          </div>
                          <p className="font-body text-xs text-ash italic mt-0.5">{item.desc}</p>
                          {!done && <div className="font-mono text-xs text-ash/60 mt-0.5">{fmtCost(item.cost)}</div>}
                          {!prereqsMet && (
                            <div className="font-mono text-xs text-blood-dark/70 mt-0.5">
                              Benötigt: {item.requires.map((r) => RESEARCH[r]?.name ?? r).join(', ')}
                            </div>
                          )}
                        </div>
                        {!done && (
                          <Btn
                            onClick={() => doResearch(item.id)}
                            disabled={!available || !affordable}
                            variant={available && affordable ? 'rune' : 'ghost'}
                            className="shrink-0"
                          >
                            Erforschen
                          </Btn>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </GrimPanel>
  )
}
