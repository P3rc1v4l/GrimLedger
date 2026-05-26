import { useState, useEffect } from 'react'
import { useGameStore } from '../../store/gameStore'

const STEPS = [
  {
    id: 'welcome',
    panel: 'dashboard',
    title: '📖 Willkommen im Grim Ledger',
    body: 'Du hast ein verfluchtes Buch gefunden. Es sammelt Seelen, Knochen, Blut — und Macht. Dein Ziel: wachse, steige auf, korrumpiere die Realität.\n\nDas Buch läuft automatisch. Du entscheidest, wohin du deine Ressourcen investierst.',
    hint: 'Navigiere links zu "Gebäude" →',
    nextPanel: 'gebaeude',
    highlight: null,
  },
  {
    id: 'buildings',
    panel: 'gebaeude',
    title: '🏛️ Die Seelenquelle',
    body: 'Die Seelenquelle ist dein erstes Gebäude — sie läuft bereits auf Stufe 1 und produziert automatisch Seelen pro Sekunde.\n\nKlicke auf "⬆️ Upgrade" um sie auf Stufe 2 zu bringen. Kosten: 21 Seelen.',
    hint: 'Klicke den ⬆️ Upgrade-Button der Seelenquelle',
    nextPanel: null,
    highlight: 'building-seelenquelle',
    waitFor: 'upgraded',
  },
  {
    id: 'resources',
    panel: 'ressourcen',
    title: '💀 Ressourcen verstehen',
    body: 'Links in der Seitenleiste siehst du immer deine Produktionsrate. Hier im Ressourcen-Panel siehst du alle Details.\n\nSeelen sind deine wichtigste Ressource. Mit ihnen baust du Gebäude, erforschst Technologien und beschwörst Wesen.',
    hint: 'Schau dir deine Ressourcen an, dann weiter →',
    nextPanel: 'forschung',
    highlight: null,
  },
  {
    id: 'research',
    panel: 'forschung',
    title: '📜 Forschung',
    body: 'Drei Forschungspfade:\n\n⚙️ Produktion — mehr Ressourcen pro Sekunde\n🔮 Beschwörung — mächtigere Wesen\n💫 Korrumpierung — seltene Ressourcen, Realitätsrisse\n\nStarte mit "Verdorbene Effizienz" wenn du 30 Wissen hast.',
    hint: 'Sammle Wissen durch Gebäude-Upgrades',
    nextPanel: 'beschwoerung',
    highlight: null,
  },
  {
    id: 'summon',
    panel: 'beschwoerung',
    title: '🔮 Wesen beschwören',
    body: 'Nach der Forschung "Erste Beschwörung" kannst du Dämonen und Wächter aus dem Jenseits rufen.\n\nBeschwörte Wesen kämpfen automatisch gegen Bosse und bringen seltene Belohnungen.',
    hint: 'Erforsche zuerst "Erste Beschwörung"',
    nextPanel: 'bosse',
    highlight: null,
  },
  {
    id: 'bosses',
    panel: 'bosse',
    title: '⚔️ Bosskämpfe',
    body: 'Bosse sind deine größten Herausforderungen — und Chancen. Sie kämpfen automatisch gegen deine Wesen.\n\nBosse bringen seltene Ressourcen und Wissen. Starte mit "Vergessenes Echo" (200 Seelen).',
    hint: 'Beschwöre ein Wesen und fordere dann einen Boss heraus',
    nextPanel: 'aufstieg',
    highlight: null,
  },
  {
    id: 'ascension',
    panel: 'aufstieg',
    title: '⬡ Aufstieg — Neues Spiel+',
    body: 'Wenn du Level 10 und 50.000 Seelen gesammelt hast, kannst du aufsteigen.\n\nDein Fortschritt wird zurückgesetzt — aber du erhältst permanente Abyss-Marken ⬡ die jeden weiteren Run stärker machen.\n\nJetzt weißt du alles. Viel Erfolg!',
    hint: 'Das Grim Ledger gehört dir. 🏴',
    nextPanel: null,
    highlight: null,
    last: true,
  },
]

export default function TutorialOverlay() {
  const { tutorial, setPanel, advanceTutorial, dismissTutorial } = useGameStore((s) => ({
    tutorial: s.tutorial,
    setPanel: s.setPanel,
    advanceTutorial: s.advanceTutorial,
    dismissTutorial: s.dismissTutorial,
  }))

  const [visible, setVisible] = useState(true)

  if (!tutorial?.active || !visible) return null

  const step = STEPS[tutorial.step ?? 0]
  if (!step) return null

  const progress = ((tutorial.step ?? 0) / STEPS.length) * 100

  const handleNext = () => {
    if (step.nextPanel) setPanel(step.nextPanel)
    if (step.last) {
      dismissTutorial()
    } else {
      advanceTutorial()
    }
  }

  return (
    <>
      {/* Semi-transparent backdrop at bottom */}
      <div className="fixed bottom-0 left-0 right-0 z-50 pointer-events-none h-40"
        style={{ background: 'linear-gradient(to top, rgba(8,6,8,0.95) 0%, transparent 100%)' }} />

      {/* Tutorial card */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[60] w-full max-w-md px-4 pointer-events-none">
        <div
          className="pointer-events-all rounded-xl border overflow-hidden shadow-2xl"
          style={{
            background: 'linear-gradient(160deg, #1a0f1a 0%, #0d080d 100%)',
            borderColor: '#8a6c1a',
            boxShadow: '0 0 40px rgba(201,162,39,0.2), 0 8px 32px rgba(0,0,0,0.8)',
          }}
        >
          {/* Gold progress bar */}
          <div style={{ height: '2px', background: '#1a0f1a' }}>
            <div style={{ height: '100%', width: `${progress}%`, background: '#c9a227', transition: 'width 0.5s ease' }} />
          </div>

          <div style={{ padding: '16px' }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px', marginBottom: '10px' }}>
              <div>
                <div style={{ fontFamily: 'JetBrains Mono', fontSize: '10px', color: '#8a6c1a', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '4px' }}>
                  Tutorial {(tutorial.step ?? 0) + 1} / {STEPS.length}
                </div>
                <h3 style={{ fontFamily: 'Cinzel', fontSize: '14px', color: '#c9a227', fontWeight: 600 }}>{step.title}</h3>
              </div>
              <button
                onClick={dismissTutorial}
                style={{ fontFamily: 'JetBrains Mono', fontSize: '11px', color: '#4a4048', cursor: 'pointer', background: 'none', border: 'none', padding: '2px 4px', flexShrink: 0, marginTop: '2px' }}
              >
                überspringen
              </button>
            </div>

            {/* Body text */}
            <p style={{ fontFamily: 'EB Garamond', fontSize: '14px', color: '#c8b89a', lineHeight: 1.6, marginBottom: '12px', whiteSpace: 'pre-line' }}>
              {step.body}
            </p>

            {/* Hint */}
            <div style={{ fontFamily: 'JetBrains Mono', fontSize: '11px', color: '#6b5f6a', marginBottom: '12px', padding: '6px 10px', background: 'rgba(74,0,0,0.15)', borderRadius: '4px', borderLeft: '2px solid #4a0000' }}>
              💡 {step.hint}
            </div>

            {/* Button */}
            <button
              onClick={handleNext}
              className="btn-gold"
              style={{ width: '100%', justifyContent: 'center', fontSize: '13px', padding: '10px' }}
            >
              {step.last ? '🏴 Los geht\'s!' : step.nextPanel ? `Weiter → ${step.nextPanel.charAt(0).toUpperCase() + step.nextPanel.slice(1)}` : 'Verstanden →'}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
