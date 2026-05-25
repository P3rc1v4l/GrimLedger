import { useGameStore } from '../../store/gameStore'
import { GrimPanel, PanelHeader, Btn, ProgressBar, GrimDivider, SectionLabel, StatCard } from '../ui'
import { PRESTIGE_THRESHOLD, ASCENSION_BONUSES, RESOURCES } from '../../utils/constants'
import { fmt } from '../../utils/helpers'
import { getPrestigeProdMult } from '../../systems/production'
import { clsx } from 'clsx'

export default function AscensionPanel() {
  const { resources, player, stats, prestige, researchDone, canAscend, calcAscensionMarks, performAscension } = useGameStore((s) => ({
    resources: s.resources,
    player: s.player,
    stats: s.stats,
    prestige: s.prestige,
    researchDone: s.researchDone,
    canAscend: s.canAscend,
    calcAscensionMarks: s.calcAscensionMarks,
    performAscension: s.performAscension,
  }))

  const ready       = canAscend()
  const marksGain   = calcAscensionMarks()
  const prodMult    = getPrestigeProdMult(prestige.count, researchDone)
  const nextBonus   = ASCENSION_BONUSES[Math.min(prestige.count, ASCENSION_BONUSES.length - 1)]

  const seelenPct  = Math.min(1, (resources.seelen ?? 0) / PRESTIGE_THRESHOLD.seelen)
  const levelPct   = Math.min(1, player.level / PRESTIGE_THRESHOLD.level)

  const handleAscend = () => {
    if (!ready) return
    if (!window.confirm(
      `Aufstieg #${prestige.count + 1} durchführen?\n\n` +
      `Ressourcen und Gebäude werden zurückgesetzt.\n` +
      `Du erhältst ${marksGain} Abyss-Marken ⬡ als permanenten Bonus.\n\n` +
      `Bist du bereit?`
    )) return
    performAscension()
  }

  return (
    <GrimPanel className="h-full flex flex-col">
      <PanelHeader icon="⬡" title="Aufstieg" subtitle="Verlasse die Welt — kehre mächtiger zurück" />
      <div className="grimPanel-body flex-1 space-y-4">

        {/* Current bonus */}
        {prestige.count > 0 && (
          <div className="statCard border border-gold-dark/40 space-y-2">
            <div className="sectionLabel text-gold/70">Aktiver Aufstiegs-Bonus</div>
            <div className="grid grid-cols-2 gap-2">
              <StatCard label="Produktion" value={`×${prodMult.toFixed(2)}`} color="text-gold" />
              <StatCard label="Abyss-Marken" value={fmt(prestige.abyssMarksTotal)} color="text-gold animate-flicker" />
            </div>
          </div>
        )}

        {/* Requirements */}
        <div className="space-y-2">
          <SectionLabel>Voraussetzungen für Aufstieg #{prestige.count + 1}</SectionLabel>
          <div className="space-y-1">
            <div className="flex justify-between font-mono text-xs">
              <span className="text-ash">Seelen</span>
              <span className={resources.seelen >= PRESTIGE_THRESHOLD.seelen ? 'text-emerald-400' : 'text-ash'}>
                {fmt(resources.seelen)} / {fmt(PRESTIGE_THRESHOLD.seelen)} {resources.seelen >= PRESTIGE_THRESHOLD.seelen ? '✓' : ''}
              </span>
            </div>
            <ProgressBar value={seelenPct * 100} max={100} colorClass="bg-purple-800" />
          </div>
          <div className="space-y-1">
            <div className="flex justify-between font-mono text-xs">
              <span className="text-ash">Spielerlevel</span>
              <span className={player.level >= PRESTIGE_THRESHOLD.level ? 'text-emerald-400' : 'text-ash'}>
                {player.level} / {PRESTIGE_THRESHOLD.level} {player.level >= PRESTIGE_THRESHOLD.level ? '✓' : ''}
              </span>
            </div>
            <ProgressBar value={levelPct * 100} max={100} colorClass="bg-blood" />
          </div>
        </div>

        {/* Next bonus preview */}
        {nextBonus && (
          <div className="statCard border border-ash-dark/30 space-y-1">
            <div className="sectionLabel">Nächster Bonus</div>
            <div className="font-mono text-sm text-gold">{nextBonus.label}</div>
            <div className="font-mono text-xs text-ash">+{marksGain} Abyss-Marken ⬡</div>
          </div>
        )}

        {/* Ascend button */}
        <Btn
          onClick={handleAscend}
          disabled={!ready}
          variant={ready ? 'gold' : 'ghost'}
          className="w-full justify-center py-3 text-sm"
        >
          {ready
            ? `⬡ Aufstieg #${prestige.count + 1} durchführen (+${marksGain} ⬡)`
            : '🔒 Voraussetzungen nicht erfüllt'}
        </Btn>

        {ready && (
          <p className="font-mono text-xs text-blood-dark text-center">
            ⚠️ Alle Ressourcen und Gebäude werden zurückgesetzt. Abyss-Marken sind permanent.
          </p>
        )}

        <GrimDivider />

        {/* History */}
        <SectionLabel>Aufstiegs-Verlauf</SectionLabel>
        {prestige.count === 0 ? (
          <p className="font-body text-ash italic text-sm">Noch kein Aufstieg durchgeführt.</p>
        ) : (
          <div className="space-y-1">
            {prestige.ascendedAt.map((ts, i) => (
              <div key={i} className="flex justify-between font-mono text-xs text-ash">
                <span>Aufstieg #{i + 1}</span>
                <span className="text-gold/70">{ASCENSION_BONUSES[i]?.label ?? 'Kompound-Bonus'}</span>
                <span>{new Date(ts).toLocaleDateString('de-DE')}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </GrimPanel>
  )
}
