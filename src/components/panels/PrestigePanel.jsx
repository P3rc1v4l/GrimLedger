import { useGameStore } from '../../store/gameStore'
import { Panel, PanelHeader, Btn, Divider, Badge } from '../ui'
import { PRESTIGE_BONUSES, PRESTIGE_THRESHOLD_GOLD, PRESTIGE_THRESHOLD_LEVEL } from '../../utils/constants'
import { fmt } from '../../utils/helpers'

export default function PrestigePanel() {
  const { prestige, player, stats, canPrestige, performPrestige, getPrestigeBonus } = useGameStore((s) => ({
    prestige: s.prestige, player: s.player, stats: s.stats,
    canPrestige: s.canPrestige, performPrestige: s.performPrestige,
    getPrestigeBonus: s.getPrestigeBonus,
  }))

  const ready = canPrestige()
  const bonus = getPrestigeBonus()
  const nextBonus = prestige.count < PRESTIGE_BONUSES.length
    ? PRESTIGE_BONUSES[prestige.count]
    : null

  const goldProgress = Math.min(1, stats.runGoldEarned / PRESTIGE_THRESHOLD_GOLD)
  const levelProgress = Math.min(1, player.level / PRESTIGE_THRESHOLD_LEVEL)

  const handlePrestige = () => {
    if (!ready) return
    if (!window.confirm(
      `Prestige #${prestige.count + 1} durchführen?\n\n` +
      `Dein Fortschritt wird zurückgesetzt — alle Gebäude, Gold und Ressourcen.\n` +
      `Dafür erhältst du einen dauerhaften Bonus.\n\n` +
      `Bist du sicher?`
    )) return
    performPrestige()
  }

  return (
    <Panel>
      <PanelHeader icon="✨" title="Prestige — Neues Spiel+" />
      <div className="panel-body">

        {/* Current run bonus */}
        {prestige.count > 0 && (
          <div className="bg-violet-950/40 border border-violet-700/40 rounded-lg p-3 space-y-1.5">
            <p className="font-mono text-xs text-violet-400 uppercase tracking-wider">Aktiver Bonus (Run #{prestige.count})</p>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: 'Gold', value: `×${bonus.goldMult.toFixed(2)}` },
                { label: 'XP', value: `×${bonus.xpMult.toFixed(2)}` },
                { label: 'Handwerk', value: `×${bonus.craftMult.toFixed(2)}` },
                { label: 'Seelen-Rate', value: `×${bonus.soulRate.toFixed(2)}` },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between font-mono text-xs">
                  <span className="text-stone-500">{label}</span>
                  <span className="text-violet-300 font-medium">{value}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Requirements */}
        <div className="space-y-2">
          <p className="font-mono text-xs text-stone-500 uppercase tracking-wider">Voraussetzungen für Run #{prestige.count + 1}</p>
          <RequirementBar
            label="Spielerlevel"
            current={player.level}
            required={PRESTIGE_THRESHOLD_LEVEL}
            progress={levelProgress}
            color="bg-amber-500"
            met={player.level >= PRESTIGE_THRESHOLD_LEVEL}
          />
          <RequirementBar
            label="Gold verdient (dieser Run)"
            current={stats.runGoldEarned}
            required={PRESTIGE_THRESHOLD_GOLD}
            progress={goldProgress}
            color="bg-amber-600"
            met={stats.runGoldEarned >= PRESTIGE_THRESHOLD_GOLD}
          />
        </div>

        {/* Next bonus preview */}
        {nextBonus && (
          <div className="bg-stone-800/30 border border-stone-700/20 rounded-lg p-3 space-y-1">
            <p className="font-mono text-xs text-stone-500">Nächster Bonus nach Prestige:</p>
            <p className="font-mono text-sm text-amber-300 font-medium">{nextBonus.label}</p>
          </div>
        )}

        <Btn
          onClick={handlePrestige}
          disabled={!ready}
          variant="prestige"
          className="w-full justify-center text-sm py-3"
        >
          {ready ? `✨ Prestige #${prestige.count + 1} durchführen` : '🔒 Voraussetzungen fehlen noch'}
        </Btn>

        {ready && (
          <p className="text-xs text-stone-500 font-body italic text-center">
            ⚠️ Alle Gebäude, Gold und Ressourcen werden zurückgesetzt. Prestige-Boni bleiben permanent.
          </p>
        )}

        <Divider />

        {/* History */}
        <p className="font-mono text-xs text-stone-500 uppercase tracking-wider">Prestige-Verlauf</p>
        {prestige.count === 0 ? (
          <p className="text-sm text-stone-600 font-body italic">Noch kein Prestige durchgeführt.</p>
        ) : (
          <div className="space-y-1">
            {prestige.unlockedAt.map((ts, i) => (
              <div key={i} className="flex items-center justify-between text-xs font-mono text-stone-500">
                <span>Run #{i + 1}</span>
                <Badge variant="violet">{PRESTIGE_BONUSES[i]?.label ?? 'Kompound-Bonus'}</Badge>
                <span>{new Date(ts).toLocaleDateString('de-DE')}</span>
              </div>
            ))}
          </div>
        )}

        <div className="text-xs text-stone-600 font-mono text-center">
          Gesamt Gold verdient (alle Runs): {fmt(prestige.totalGoldEarned)} 💰
        </div>
      </div>
    </Panel>
  )
}

function RequirementBar({ label, current, required, progress, color, met }) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between font-mono text-xs">
        <span className="text-stone-400">{label}</span>
        <span className={met ? 'text-emerald-400' : 'text-stone-500'}>
          {fmt(current)} / {fmt(required)} {met ? '✓' : ''}
        </span>
      </div>
      <div className="progress-track">
        <div className={`progress-fill ${color}`} style={{ width: `${progress * 100}%` }} />
      </div>
    </div>
  )
}
