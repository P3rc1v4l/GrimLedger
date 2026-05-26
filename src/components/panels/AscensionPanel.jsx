import { useGameStore } from '../../store/gameStore'
import { ASCENSION_REQ, ASCENSION_BONUSES } from '../../utils/constants'
import { calcPrestigeMult } from '../../systems/production'
import { fmt, fmtPlayTime } from '../../utils/helpers'
import { PANEL_STYLE, PanelHeader, Btn, Card, ProgressBar, SLabel, Divider, C } from '../ui/primitives'

export default function AscensionPanel() {
  const resources    = useGameStore(s => s.resources)
  const player       = useGameStore(s => s.player)
  const prestige     = useGameStore(s => s.prestige)
  const researchDone = useGameStore(s => s.researchDone)
  const canAscend    = useGameStore(s => s.canAscend)
  const marks        = useGameStore(s => s.ascensionMarks)
  const doAscend     = useGameStore(s => s.performAscension)

  const ready      = canAscend()
  const markGain   = marks()
  const prodMult   = calcPrestigeMult(prestige.count, researchDone)
  const nextBonus  = ASCENSION_BONUSES[Math.min(prestige.count, ASCENSION_BONUSES.length - 1)]

  const seelenPct  = Math.min(1, (resources.seelen ?? 0) / ASCENSION_REQ.seelen)
  const levelPct   = Math.min(1, player.level / ASCENSION_REQ.level)

  const handleAscend = () => {
    if (!ready) return
    if (!window.confirm(
      `Aufstieg #${prestige.count + 1} durchführen?\n\n` +
      `Ressourcen und Gebäude werden zurückgesetzt.\n` +
      `Du erhältst ${markGain} Abyss-Marken ⬡.\n\n` +
      `Bereit?`
    )) return
    doAscend()
  }

  return (
    <div style={PANEL_STYLE}>
      <PanelHeader icon="⬡" title="Aufstieg" subtitle="Verlasse die Welt — kehre mächtiger zurück" />
      <div className="panel-scroll" style={{ padding: '14px', display: 'flex', flexDirection: 'column', gap: '12px' }}>

        {/* Current bonus */}
        {prestige.count > 0 && (
          <Card style={{ border: `1px solid ${C.gold}40` }}>
            <SLabel>Aktiver Aufstiegs-Bonus</SLabel>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '6px' }}>
              <div>
                <div style={{ fontFamily: 'JetBrains Mono', fontSize: '9px', color: C.textSub }}>Produktion</div>
                <div style={{ fontFamily: 'Cinzel', fontSize: '16px', color: C.gold }}>×{prodMult.toFixed(2)}</div>
              </div>
              <div>
                <div style={{ fontFamily: 'JetBrains Mono', fontSize: '9px', color: C.textSub }}>Abyss-Marken</div>
                <div style={{ fontFamily: 'Cinzel', fontSize: '16px', color: C.gold }}>{fmt(prestige.abyssTotal)} ⬡</div>
              </div>
            </div>
          </Card>
        )}

        {/* Requirements */}
        <SLabel>Voraussetzungen für Aufstieg #{prestige.count + 1}</SLabel>
        <Card>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[
              { label: 'Seelen', current: resources.seelen ?? 0, required: ASCENSION_REQ.seelen, pct: seelenPct, color: '#a855f7' },
              { label: 'Spielerlevel', current: player.level, required: ASCENSION_REQ.level, pct: levelPct, color: '#8b0000' },
            ].map(({ label, current, required, pct, color }) => (
              <div key={label}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'JetBrains Mono', fontSize: '11px', marginBottom: '4px' }}>
                  <span style={{ color: C.textDim }}>{label}</span>
                  <span style={{ color: pct >= 1 ? C.green : C.textSub }}>
                    {fmt(current)} / {fmt(required)} {pct >= 1 ? '✓' : ''}
                  </span>
                </div>
                <ProgressBar value={pct * 100} max={100} color={color} height={4} />
              </div>
            ))}
          </div>
        </Card>

        {/* Next bonus preview */}
        {nextBonus && (
          <Card>
            <div style={{ fontFamily: 'JetBrains Mono', fontSize: '9px', color: C.textSub, marginBottom: '4px' }}>Nächster Bonus</div>
            <div style={{ fontFamily: 'Cinzel', fontSize: '13px', color: C.gold }}>{nextBonus.label}</div>
            <div style={{ fontFamily: 'JetBrains Mono', fontSize: '10px', color: C.textDim, marginTop: '3px' }}>+{markGain} Abyss-Marken ⬡</div>
          </Card>
        )}

        {/* Ascend button */}
        <Btn
          onClick={handleAscend}
          disabled={!ready}
          variant={ready ? 'gold' : 'default'}
          style={{ width: '100%', justifyContent: 'center', padding: '12px', fontSize: '13px' }}
        >
          {ready
            ? `⬡ Aufstieg #${prestige.count + 1} (+${markGain} ⬡)`
            : '🔒 Voraussetzungen fehlen noch'}
        </Btn>

        {ready && (
          <div style={{ fontFamily: 'JetBrains Mono', fontSize: '10px', color: C.textSub, textAlign: 'center' }}>
            ⚠️ Ressourcen und Gebäude werden zurückgesetzt. Abyss-Marken bleiben permanent.
          </div>
        )}

        {/* History */}
        {prestige.history.length > 0 && (
          <>
            <Divider />
            <SLabel>Aufstiegs-Verlauf</SLabel>
            {prestige.history.map((h, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'JetBrains Mono', fontSize: '10px', color: C.textDim, padding: '4px 0' }}>
                <span>Aufstieg #{i + 1}</span>
                <span style={{ color: C.gold }}>+{h.marks} ⬡</span>
                <span>{new Date(h.at).toLocaleDateString('de-DE')}</span>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  )
}
