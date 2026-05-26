// ResearchPanel.jsx
import { useGameStore } from '../../store/gameStore'
import { RESEARCH, RESEARCH_PATHS, RES } from '../../utils/constants'
import { canAfford } from '../../utils/helpers'
import { PANEL_STYLE, PanelHeader, Btn, Card, SLabel, C } from '../ui/primitives'

const PATH_META = {
  produktion:    { label: 'Produktion',    icon: '⚙️', color: '#f59e0b' },
  beschwoerung:  { label: 'Beschwörung',   icon: '🔮', color: '#c084fc' },
  korrumpierung: { label: 'Korrumpierung', icon: '💫', color: '#22d3ee' },
}

export default function ResearchPanel() {
  const resources    = useGameStore(s => s.resources)
  const researchDone = useGameStore(s => s.researchDone)
  const research     = useGameStore(s => s.research)

  const byPath = {}
  for (const [id, def] of Object.entries(RESEARCH)) {
    if (!byPath[def.path]) byPath[def.path] = []
    byPath[def.path].push({ id, ...def })
  }

  return (
    <div style={PANEL_STYLE}>
      <PanelHeader icon="📜" title="Forschung" subtitle={`${researchDone.length}/${Object.keys(RESEARCH).length} erforscht`} />
      <div className="panel-scroll" style={{ padding: '14px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {RESEARCH_PATHS.map(path => {
          const meta  = PATH_META[path]
          const items = byPath[path] ?? []
          return (
            <div key={path}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <span>{meta.icon}</span>
                <span style={{ fontFamily: 'Cinzel', fontSize: '11px', color: meta.color, letterSpacing: '0.08em' }}>{meta.label}</span>
                <div style={{ flex: 1, height: '1px', background: `${meta.color}30` }} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {items.map(item => {
                  const done     = researchDone.includes(item.id)
                  const prereqs  = (item.requires ?? []).every(r => researchDone.includes(r))
                  const afford   = canAfford(resources, item.cost)
                  const avail    = prereqs && !done

                  return (
                    <Card key={item.id} style={{
                      border: `1px solid ${done ? '#16653440' : avail ? `${meta.color}30` : C.borderDim}`,
                      opacity: done ? 0.55 : prereqs ? 1 : 0.4,
                    }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                        <span style={{ fontSize: '18px', lineHeight: 1, marginTop: '2px' }}>{item.icon}</span>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                            <span style={{ fontFamily: 'Cinzel', fontSize: '11px', color: done ? C.green : C.gold }}>{item.name}</span>
                            {done && <span style={{ fontFamily: 'JetBrains Mono', fontSize: '9px', color: C.green }}>✓</span>}
                          </div>
                          <div style={{ fontFamily: 'EB Garamond', fontSize: '12px', color: C.textDim, fontStyle: 'italic', marginTop: '2px' }}>{item.desc}</div>
                          {!done && (
                            <div style={{ fontFamily: 'JetBrains Mono', fontSize: '10px', color: afford ? C.gold : C.textSub, marginTop: '3px' }}>
                              {Object.entries(item.cost).map(([k, v]) => `${v} ${RES[k]?.icon ?? k}`).join(' · ')}
                            </div>
                          )}
                          {!prereqs && (
                            <div style={{ fontFamily: 'JetBrains Mono', fontSize: '9px', color: '#ef4444', marginTop: '2px' }}>
                              Benötigt: {item.requires.map(r => RESEARCH[r]?.name ?? r).join(', ')}
                            </div>
                          )}
                        </div>
                        {!done && (
                          <Btn onClick={() => research(item.id)} disabled={!avail || !afford} variant="rune">
                            Erforschen
                          </Btn>
                        )}
                      </div>
                    </Card>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
