import { useGameStore } from '../../store/gameStore'
import { TUTORIAL } from '../../utils/constants'
import { Btn, C } from '../ui/primitives'

export default function TutorialOverlay() {
  const tutorial  = useGameStore(s => s.tutorial)
  const setPanel  = useGameStore(s => s.setPanel)
  const advance   = useGameStore(s => s.advanceTutorial)
  const dismiss   = useGameStore(s => s.dismissTutorial)

  if (!tutorial?.active) return null
  const step = TUTORIAL[tutorial.step ?? 0]
  if (!step) return null

  const pct = ((tutorial.step ?? 0) / TUTORIAL.length) * 100

  const handleNext = () => {
    if (step.goTo) setPanel(step.goTo)
    if (step.last) dismiss()
    else advance()
  }

  return (
    <div style={{
      position: 'fixed', bottom: '12px', left: '50%', transform: 'translateX(-50%)',
      zIndex: 60, width: '420px', maxWidth: '90vw', pointerEvents: 'none',
    }}>
      <div className="anim-enter" style={{
        pointerEvents: 'all',
        background: '#1e1428', border: `1px solid ${C.gold}55`,
        borderRadius: '12px', overflow: 'hidden',
        boxShadow: `0 0 40px rgba(201,162,39,0.12), 0 8px 32px rgba(0,0,0,0.8)`,
      }}>
        <div style={{ height: '2px', background: '#1a0f1a' }}>
          <div style={{ height: '100%', width: `${pct}%`, background: C.gold, transition: 'width 0.4s ease' }} />
        </div>
        <div style={{ padding: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
            <div>
              <div style={{ fontFamily: 'JetBrains Mono', fontSize: '9px', color: C.gold, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '4px' }}>
                Tutorial {(tutorial.step ?? 0) + 1}/{TUTORIAL.length}
              </div>
              <div style={{ fontFamily: 'Cinzel', fontSize: '13px', color: C.gold }}>{step.title}</div>
            </div>
            <button onClick={dismiss} style={{ fontFamily: 'JetBrains Mono', fontSize: '10px', color: C.textSub, background: 'none', border: 'none', cursor: 'pointer', marginTop: '2px' }}>
              überspringen
            </button>
          </div>
          <p style={{ fontFamily: 'EB Garamond', fontSize: '14px', color: C.text, lineHeight: 1.65, marginBottom: '10px', whiteSpace: 'pre-line' }}>
            {step.body}
          </p>
          <div style={{ fontFamily: 'JetBrains Mono', fontSize: '10px', color: C.textDim, background: 'rgba(74,0,0,0.12)', borderLeft: '2px solid #4a0000', padding: '5px 8px', borderRadius: '4px', marginBottom: '12px' }}>
            💡 {step.hint}
          </div>
          <Btn onClick={handleNext} variant="gold" style={{ width: '100%', justifyContent: 'center', fontSize: '12px', padding: '9px' }}>
            {step.last ? "🏴 Los geht's!" : 'Weiter →'}
          </Btn>
        </div>
      </div>
    </div>
  )
}
