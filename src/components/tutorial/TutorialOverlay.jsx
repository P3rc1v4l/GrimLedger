import { useGameStore } from '../../store/gameStore'
import { TUTORIAL_STEPS } from '../../systems/tutorial'

export default function TutorialOverlay() {
  const { tutorial, advanceTutorial, dismissTutorial, setTab } = useGameStore((s) => ({
    tutorial: s.tutorial,
    advanceTutorial: s.advanceTutorial,
    dismissTutorial: s.dismissTutorial,
    setTab: s.setTab,
  }))
  if (!tutorial.active) return null
  const step = TUTORIAL_STEPS[tutorial.step]
  if (!step) return null

  const handleAction = () => {
    if (step.tab) setTab(step.tab)
    advanceTutorial()
  }

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-sm px-4 pointer-events-none">
      <div className="panel pointer-events-auto animate-slideIn shadow-2xl border-amber-700/30">
        <div className="h-0.5 bg-stone-800">
          <div className="h-full bg-amber-600 transition-all duration-500" style={{ width: `${((tutorial.step) / TUTORIAL_STEPS.length) * 100}%` }} />
        </div>
        <div className="p-4 space-y-3">
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="font-mono text-xs text-amber-700 mb-1">{tutorial.step + 1}/{TUTORIAL_STEPS.length}</div>
              <h3 className="font-display text-sm text-amber-200">{step.title}</h3>
            </div>
            <button onClick={dismissTutorial} className="font-mono text-xs text-stone-600 hover:text-stone-400 mt-1 shrink-0">überspringen</button>
          </div>
          <p className="text-sm text-stone-300 font-body leading-relaxed">{step.body}</p>
          <button onClick={handleAction} className="btn-gold w-full justify-center">{step.action}</button>
        </div>
      </div>
    </div>
  )
}
