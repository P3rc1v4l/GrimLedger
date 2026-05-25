import { useState } from 'react'
import { useGameStore } from '../../store/gameStore'
import { GrimPanel, PanelHeader, Btn, GrimDivider, SectionLabel, StatCard } from '../ui'
import { fmt, fmtPlayTime } from '../../utils/helpers'

export default function SettingsPanel() {
  const { stats, prestige, resources, updateInfo, setUpdateInfo, hardReset } = useGameStore((s) => ({
    stats: s.stats,
    prestige: s.prestige,
    resources: s.resources,
    updateInfo: s.updateInfo,
    setUpdateInfo: s.setUpdateInfo,
    hardReset: s.hardReset,
  }))

  const [checkingUpdate, setCheckingUpdate] = useState(false)
  const [version, setVersion] = useState(null)

  const handleCheckUpdate = async () => {
    setCheckingUpdate(true)
    const api = window.electronAPI
    if (!api) {
      setUpdateInfo({ status: 'error', version: null })
      setCheckingUpdate(false)
      return
    }
    if (!version) {
      const v = await api.getVersion()
      setVersion(v)
    }
    await api.checkForUpdates()
    setCheckingUpdate(false)
  }

  // Load version on mount
  if (!version && window.electronAPI) {
    window.electronAPI.getVersion().then(setVersion).catch(() => {})
  }

  return (
    <GrimPanel className="h-full flex flex-col">
      <PanelHeader icon="⚙️" title="Einstellungen" subtitle="Konfiguration & Informationen" />
      <div className="grimPanel-body flex-1 space-y-4">

        {/* Version & Update */}
        <div className="space-y-2">
          <SectionLabel>Version & Updates</SectionLabel>
          <div className="statCard border border-ash-dark/30 space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-mono text-xs text-ash">GrimLedger</div>
                <div className="font-display text-sm text-gold">{version ? `v${version}` : 'Lädt...'}</div>
              </div>
              <Btn onClick={handleCheckUpdate} disabled={checkingUpdate} variant="ghost">
                {checkingUpdate ? '⏳ Prüfe...' : '🔄 Nach Updates suchen'}
              </Btn>
            </div>
            {updateInfo && (
              <div className="font-mono text-xs">
                {updateInfo.status === 'available'   && <span className="text-gold">Update v{updateInfo.version} verfügbar — siehe Banner unten</span>}
                {updateInfo.status === 'downloading' && <span className="text-blue-400">Download läuft...</span>}
                {updateInfo.status === 'downloaded'  && <span className="text-emerald-400">Update bereit — Banner unten klicken</span>}
                {updateInfo.status === 'not-available' && <span className="text-emerald-400">✓ Aktuellste Version</span>}
                {updateInfo.status === 'error'       && <span className="text-red-400">Update-Check fehlgeschlagen</span>}
              </div>
            )}
          </div>
        </div>

        <GrimDivider />

        {/* Statistics */}
        <SectionLabel>Statistiken</SectionLabel>
        <div className="grid grid-cols-2 gap-2">
          <StatCard label="Spielzeit"      value={fmtPlayTime(stats.totalPlayTime)} />
          <StatCard label="Aufstiege"      value={stats.ascensions} />
          <StatCard label="Erforschungen"  value={stats.researched} />
          <StatCard label="Beschwörungen"  value={stats.summoned} />
          <StatCard label="Bosse besiegt"  value={stats.bossKilled} />
          <StatCard label="Upgrades"       value={stats.upgraded} />
          <StatCard label="Abyss-Marken ⬡" value={fmt(resources.abyssMarken ?? 0)} color="text-gold" />
          <StatCard label="Gesamt Aufstieg" value={`#${prestige.count}`} color="text-gold" />
        </div>

        <GrimDivider />

        {/* Save / Reset */}
        <SectionLabel>Speichern & Zurücksetzen</SectionLabel>
        <div className="space-y-2">
          <p className="font-body text-xs text-ash italic">
            Das Spiel speichert automatisch. Ein manuelles Speichern ist nicht nötig.
          </p>
          <Btn
            onClick={() => {
              if (window.confirm('ACHTUNG: Kompletten Spielstand löschen?\nAlle Daten inkl. Aufstieg gehen verloren!')) {
                hardReset()
              }
            }}
            variant="danger"
            className="w-full justify-center"
          >
            ☠️ Spielstand komplett löschen
          </Btn>
        </div>
      </div>
    </GrimPanel>
  )
}
