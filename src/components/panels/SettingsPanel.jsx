import { useState, useRef } from 'react'
import { useGameStore } from '../../store/gameStore'
import { fmt, fmtPlayTime } from '../../utils/helpers'
import { PANEL_STYLE, PanelHeader, Btn, Card, SLabel, Divider, C } from '../ui/primitives'

function Row({ label, desc, children }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', padding: '10px 0', borderBottom: `1px solid ${C.borderDim}` }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontFamily: 'JetBrains Mono', fontSize: '11px', color: C.text }}>{label}</div>
        {desc && <div style={{ fontFamily: 'EB Garamond', fontSize: '12px', color: C.textDim, fontStyle: 'italic', marginTop: '2px' }}>{desc}</div>}
      </div>
      <div style={{ flexShrink: 0 }}>{children}</div>
    </div>
  )
}

function Toggle({ value, onChange }) {
  return (
    <button onClick={() => onChange(!value)} style={{ width: '40px', height: '22px', borderRadius: '11px', border: `1px solid ${value ? C.gold : C.borderDim}`, background: value ? 'rgba(201,162,39,0.35)' : C.bg2, cursor: 'pointer', position: 'relative', transition: 'all 0.2s', flexShrink: 0 }}>
      <div style={{ position: 'absolute', top: '3px', left: value ? '20px' : '3px', width: '14px', height: '14px', borderRadius: '50%', background: value ? C.gold : C.textSub, transition: 'left 0.2s' }} />
    </button>
  )
}

function NumInput({ value, min, max, step = 1, onChange }) {
  return (
    <input type="number" value={value} min={min} max={max} step={step}
      onChange={e => onChange(Number(e.target.value))}
      style={{ fontFamily: 'JetBrains Mono', fontSize: '11px', width: '70px', padding: '5px 8px', borderRadius: '6px', border: `1px solid ${C.border}`, background: '#0f0a17', color: C.text, outline: 'none', textAlign: 'right' }}
    />
  )
}

export default function SettingsPanel() {
  const { settings, stats, prestige, resources, achievements,
    updateSettings, resetTutorial, exportSave, importSave, hardReset,
    updateInfo, setUpdateInfo } = useGameStore(s => ({
    settings: s.settings, stats: s.stats, prestige: s.prestige,
    resources: s.resources, achievements: s.achievements,
    updateSettings: s.updateSettings, resetTutorial: s.resetTutorial,
    exportSave: s.exportSave, importSave: s.importSave,
    hardReset: s.hardReset, updateInfo: s.updateInfo, setUpdateInfo: s.setUpdateInfo,
  }))

  const [checking, setChecking] = useState(false)
  const [version, setVersion]   = useState(null)
  const [importMsg, setImportMsg] = useState(null)
  const fileRef = useRef(null)

  const s = settings ?? {}

  if (!version && window.api) window.api.getVersion().then(setVersion).catch(() => {})

  const checkUpdate = async () => {
    setChecking(true)
    await window.api?.checkForUpdates().catch(() => {})
    setChecking(false)
  }

  const handleFile = e => {
    const file = e.target.files?.[0]
    if (!file) return
    const r = new FileReader()
    r.onload = ev => { importSave(ev.target.result); setImportMsg('ok'); setTimeout(() => setImportMsg(null), 3000) }
    r.onerror = () => setImportMsg('error')
    r.readAsText(file)
    e.target.value = ''
  }

  return (
    <div style={PANEL_STYLE}>
      <PanelHeader icon="⚙️" title="Einstellungen" subtitle="Konfiguration & Präferenzen" />
      <div className="panel-scroll" style={{ padding: '14px', display: 'flex', flexDirection: 'column', gap: '2px' }}>

        <SLabel>Anzeige</SLabel>
        <Row label="Produktionsraten anzeigen" desc="Rate/s in der rechten Seitenleiste">
          <Toggle value={s.showRates ?? true} onChange={v => updateSettings({ showRates: v })} />
        </Row>
        <Row label="Kompakte Zahlen" desc="Weniger Dezimalstellen">
          <Toggle value={s.compactNumbers ?? false} onChange={v => updateSettings({ compactNumbers: v })} />
        </Row>
        <Row label="Chronik-Länge" desc="Max. Log-Einträge (20–200)">
          <NumInput value={s.logMaxEntries ?? 80} min={20} max={200} step={10} onChange={v => updateSettings({ logMaxEntries: v })} />
        </Row>

        <SLabel style={{ marginTop: '10px' }}>Gameplay</SLabel>
        <Row label="Offline-Stunden (Basis)" desc="Wie viele Stunden offline produziert wird">
          <NumInput value={s.offlineCapHours ?? 8} min={4} max={24} onChange={v => updateSettings({ offlineCapHours: v })} />
        </Row>
        <Row label="Tutorial zurücksetzen" desc="Zeigt das Tutorial von Anfang an">
          <Btn onClick={resetTutorial} variant="rune">Neu starten</Btn>
        </Row>

        <SLabel style={{ marginTop: '10px' }}>Spielstand</SLabel>
        <Row label="Exportieren" desc="Spielstand als JSON-Datei speichern">
          <Btn onClick={exportSave} variant="gold">💾 Exportieren</Btn>
        </Row>
        <Row label="Importieren" desc="JSON-Spielstand laden">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {importMsg === 'ok'    && <span style={{ fontFamily: 'JetBrains Mono', fontSize: '10px', color: C.green }}>✓ Geladen</span>}
            {importMsg === 'error' && <span style={{ fontFamily: 'JetBrains Mono', fontSize: '10px', color: '#ef4444' }}>Fehler!</span>}
            <Btn onClick={() => fileRef.current?.click()} variant="default">📂 Importieren</Btn>
            <input ref={fileRef} type="file" accept=".json" style={{ display: 'none' }} onChange={handleFile} />
          </div>
        </Row>

        <SLabel style={{ marginTop: '10px' }}>Version & Updates</SLabel>
        <Row label={`GrimLedger ${version ? `v${version}` : '...'}`}>
          <Btn onClick={checkUpdate} disabled={checking} variant="default">
            {checking ? '⏳ Prüfe...' : '🔄 Updates prüfen'}
          </Btn>
        </Row>
        {updateInfo && (
          <Card>
            <span style={{ fontFamily: 'JetBrains Mono', fontSize: '11px', color: updateInfo.status === 'not-available' ? C.green : updateInfo.status === 'error' ? '#ef4444' : C.gold }}>
              {updateInfo.status === 'available'    && `Update v${updateInfo.version} verfügbar`}
              {updateInfo.status === 'not-available'&& '✓ Neuste Version installiert'}
              {updateInfo.status === 'downloading'  && 'Download läuft...'}
              {updateInfo.status === 'downloaded'   && 'Update bereit — Banner unten'}
              {updateInfo.status === 'error'        && 'Prüfung fehlgeschlagen'}
            </span>
          </Card>
        )}

        <SLabel style={{ marginTop: '10px' }}>Statistiken</SLabel>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
          {[
            { label: 'Spielzeit',     value: fmtPlayTime(stats.playTime) },
            { label: 'Aufstiege',     value: stats.ascensions },
            { label: 'Erforschungen', value: stats.researched },
            { label: 'Beschwörungen', value: stats.summoned },
            { label: 'Bosse besiegt', value: stats.bossKilled },
            { label: 'Upgrades',      value: stats.upgraded },
            { label: 'Achievements',  value: `${achievements.unlocked.length}/18` },
            { label: 'Abyss-Marken',  value: `${fmt(resources.abyssMarken ?? 0)} ⬡` },
          ].map(({ label, value }) => (
            <Card key={label}>
              <div style={{ fontFamily: 'JetBrains Mono', fontSize: '9px', color: C.textSub }}>{label}</div>
              <div style={{ fontFamily: 'JetBrains Mono', fontSize: '12px', color: C.text, marginTop: '2px' }}>{value}</div>
            </Card>
          ))}
        </div>

        <SLabel style={{ marginTop: '10px' }}>⚠️ Gefahrenzone</SLabel>
        <Row label="Spielstand löschen" desc="Alle Daten inkl. Achievements und Aufstiege">
          <Btn
            onClick={() => { if (window.confirm('ACHTUNG: Alles löschen? Dieser Vorgang kann nicht rückgängig gemacht werden!')) hardReset() }}
            variant="danger"
          >
            ☠️ Alles löschen
          </Btn>
        </Row>
      </div>
    </div>
  )
}
