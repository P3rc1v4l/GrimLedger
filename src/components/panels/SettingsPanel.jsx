import { useState, useRef } from 'react'
import { useGameStore } from '../../store/gameStore'
import { GrimPanel, PanelHeader, GrimDivider } from '../ui'
import { fmt, fmtPlayTime } from '../../utils/helpers'

function SettingRow({ label, desc, children }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', padding: '10px 0', borderBottom: '1px solid rgba(42,32,40,0.3)' }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontFamily: 'JetBrains Mono', fontSize: '12px', color: '#c8b89a' }}>{label}</div>
        {desc && <div style={{ fontFamily: 'EB Garamond', fontSize: '12px', color: '#4a4048', fontStyle: 'italic', marginTop: '2px' }}>{desc}</div>}
      </div>
      <div style={{ flexShrink: 0 }}>{children}</div>
    </div>
  )
}

function Toggle({ value, onChange }) {
  return (
    <button
      onClick={() => onChange(!value)}
      style={{
        width: '44px', height: '24px',
        borderRadius: '12px',
        border: '1px solid',
        borderColor: value ? '#8a6c1a' : '#2a2028',
        background: value ? 'rgba(138,108,26,0.4)' : 'rgba(20,15,20,0.5)',
        cursor: 'pointer',
        position: 'relative',
        transition: 'all 0.2s',
      }}
    >
      <div style={{
        position: 'absolute',
        top: '3px',
        left: value ? '22px' : '3px',
        width: '16px', height: '16px',
        borderRadius: '50%',
        background: value ? '#c9a227' : '#2a2028',
        transition: 'left 0.2s',
      }} />
    </button>
  )
}

function Select({ value, options, onChange }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={{
        fontFamily: 'JetBrains Mono', fontSize: '11px',
        padding: '5px 8px',
        borderRadius: '6px',
        border: '1px solid #2a2028',
        background: '#0f0a17',
        color: '#c8b89a',
        cursor: 'pointer',
        outline: 'none',
      }}
    >
      {options.map(({ value: v, label }) => (
        <option key={v} value={v}>{label}</option>
      ))}
    </select>
  )
}

function NumberInput({ value, min, max, step = 1, onChange }) {
  return (
    <input
      type="number"
      value={value}
      min={min}
      max={max}
      step={step}
      onChange={(e) => onChange(Number(e.target.value))}
      style={{
        fontFamily: 'JetBrains Mono', fontSize: '11px',
        width: '72px',
        padding: '5px 8px',
        borderRadius: '6px',
        border: '1px solid #2a2028',
        background: '#0f0a17',
        color: '#c8b89a',
        outline: 'none',
        textAlign: 'right',
      }}
    />
  )
}

function ActionBtn({ onClick, disabled, children, variant = 'ghost' }) {
  const colors = {
    ghost:  { border: '#2a2028', bg: 'rgba(20,15,20,0.5)',      color: '#6b5f6a',  hBg: 'rgba(42,32,40,0.5)', hColor: '#c8b89a' },
    gold:   { border: '#8a6c1a', bg: 'rgba(138,108,26,0.25)',   color: '#c9a227',  hBg: 'rgba(201,162,39,0.3)', hColor: '#e8c84a' },
    danger: { border: '#4a0000', bg: 'rgba(74,0,0,0.3)',        color: '#ef4444',  hBg: 'rgba(139,0,0,0.4)', hColor: '#ff6b6b' },
    rune:   { border: '#6b21a8', bg: 'rgba(107,33,168,0.15)',   color: '#9333ea',  hBg: 'rgba(147,51,234,0.25)', hColor: '#c084fc' },
  }
  const c = colors[variant]
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        fontFamily: 'JetBrains Mono', fontSize: '11px', fontWeight: 500,
        padding: '7px 14px',
        borderRadius: '6px',
        border: `1px solid ${c.border}`,
        background: c.bg,
        color: disabled ? '#2a2028' : c.color,
        cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'all 0.15s',
        whiteSpace: 'nowrap',
      }}
      onMouseEnter={(e) => { if (!disabled) { e.currentTarget.style.background = c.hBg; e.currentTarget.style.color = c.hColor } }}
      onMouseLeave={(e) => { if (!disabled) { e.currentTarget.style.background = c.bg; e.currentTarget.style.color = c.color } }}
    >
      {children}
    </button>
  )
}

function SectionTitle({ children }) {
  return (
    <div style={{ fontFamily: 'JetBrains Mono', fontSize: '10px', color: 'rgba(74,0,0,0.7)', textTransform: 'uppercase', letterSpacing: '0.15em', paddingTop: '12px', paddingBottom: '4px' }}>
      {children}
    </div>
  )
}

export default function SettingsPanel() {
  const {
    stats, prestige, resources, achievements,
    updateInfo, setUpdateInfo,
    settings, updateSettings,
    hardReset, resetTutorial,
    exportSave, importSave,
  } = useGameStore((s) => ({
    stats: s.stats, prestige: s.prestige, resources: s.resources,
    achievements: s.achievements,
    updateInfo: s.updateInfo, setUpdateInfo: s.setUpdateInfo,
    settings: s.settings, updateSettings: s.updateSettings,
    hardReset: s.hardReset, resetTutorial: s.resetTutorial,
    exportSave: s.exportSave, importSave: s.importSave,
  }))

  const [checkingUpdate, setCheckingUpdate] = useState(false)
  const [version, setVersion] = useState(null)
  const [importStatus, setImportStatus] = useState(null)
  const fileRef = useRef(null)

  const s = settings ?? {}

  if (!version && window.electronAPI) {
    window.electronAPI.getVersion().then(setVersion).catch(() => {})
  }

  const handleCheckUpdate = async () => {
    setCheckingUpdate(true)
    const api = window.electronAPI
    if (!api) { setUpdateInfo({ status: 'error' }); setCheckingUpdate(false); return }
    await api.checkForUpdates()
    setCheckingUpdate(false)
  }

  const handleFileImport = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      importSave(ev.target.result)
      setImportStatus('ok')
      setTimeout(() => setImportStatus(null), 3000)
    }
    reader.onerror = () => setImportStatus('error')
    reader.readAsText(file)
    e.target.value = ''
  }

  return (
    <GrimPanel>
      <PanelHeader icon="⚙️" title="Einstellungen" subtitle="Konfiguration & Präferenzen" />
      <div className="grimPanel-body">

        {/* ── Anzeige ── */}
        <SectionTitle>Anzeige</SectionTitle>
        <SettingRow label="Zahlen-Notation" desc="Wie große Zahlen angezeigt werden">
          <Select
            value={s.numberNotation ?? 'short'}
            onChange={(v) => updateSettings({ numberNotation: v })}
            options={[
              { value: 'short', label: 'K / M / B / T' },
              { value: 'scientific', label: '1.5e6' },
            ]}
          />
        </SettingRow>
        <SettingRow label="Kompakte Zahlen" desc="Keine Dezimalstellen bei kleinen Zahlen">
          <Toggle value={s.compactNumbers ?? false} onChange={(v) => updateSettings({ compactNumbers: v })} />
        </SettingRow>
        <SettingRow label="Produktionsraten anzeigen" desc="Rate/s in der rechten Seitenleiste">
          <Toggle value={s.showProductionRates ?? true} onChange={(v) => updateSettings({ showProductionRates: v })} />
        </SettingRow>
        <SettingRow label="Chronik-Länge" desc="Maximale Anzahl Log-Einträge (10–300)">
          <NumberInput value={s.logSize ?? 100} min={10} max={300} step={10} onChange={(v) => updateSettings({ logSize: v })} />
        </SettingRow>

        {/* ── Gameplay ── */}
        <SectionTitle>Gameplay</SectionTitle>
        <SettingRow label="Offline-Stunden (Basis)" desc="Wie viele Stunden offline produziert wird (8–24)">
          <NumberInput value={s.offlineCapHours ?? 8} min={8} max={24} step={1} onChange={(v) => updateSettings({ offlineCapHours: v })} />
        </SettingRow>
        <SettingRow label="Tutorial zurücksetzen" desc="Zeigt das Tutorial von Anfang an">
          <ActionBtn onClick={resetTutorial} variant="rune">Tutorial neu starten</ActionBtn>
        </SettingRow>

        {/* ── Speichern ── */}
        <SectionTitle>Speichern & Exportieren</SectionTitle>
        <SettingRow label="Spielstand exportieren" desc="Speichert deinen Fortschritt als JSON-Datei">
          <ActionBtn onClick={exportSave} variant="gold">💾 Exportieren</ActionBtn>
        </SettingRow>
        <SettingRow label="Spielstand importieren" desc="Lädt einen exportierten Spielstand">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {importStatus === 'ok'    && <span style={{ fontFamily: 'JetBrains Mono', fontSize: '10px', color: '#4ade80' }}>✓ Importiert</span>}
            {importStatus === 'error' && <span style={{ fontFamily: 'JetBrains Mono', fontSize: '10px', color: '#ef4444' }}>Fehler!</span>}
            <ActionBtn onClick={() => fileRef.current?.click()} variant="ghost">📂 Importieren</ActionBtn>
            <input ref={fileRef} type="file" accept=".json" style={{ display: 'none' }} onChange={handleFileImport} />
          </div>
        </SettingRow>

        {/* ── Updates ── */}
        <SectionTitle>Version & Updates</SectionTitle>
        <SettingRow label={`GrimLedger ${version ? `v${version}` : '...'}`} desc="Auf neue Versionen prüfen">
          <ActionBtn onClick={handleCheckUpdate} disabled={checkingUpdate} variant="ghost">
            {checkingUpdate ? '⏳ Prüfe...' : '🔄 Auf Updates prüfen'}
          </ActionBtn>
        </SettingRow>
        {updateInfo && (
          <div style={{ fontFamily: 'JetBrains Mono', fontSize: '11px', padding: '8px 10px', borderRadius: '6px', background: 'rgba(15,10,21,0.6)', border: '1px solid rgba(42,32,40,0.4)' }}>
            {updateInfo.status === 'available'    && <span style={{ color: '#c9a227' }}>Update v{updateInfo.version} verfügbar — Banner unten</span>}
            {updateInfo.status === 'downloading'  && <span style={{ color: '#60a5fa' }}>Download läuft...</span>}
            {updateInfo.status === 'downloaded'   && <span style={{ color: '#4ade80' }}>Update bereit — Banner unten klicken</span>}
            {updateInfo.status === 'not-available'&& <span style={{ color: '#4ade80' }}>✓ Neuste Version</span>}
            {updateInfo.status === 'error'        && <span style={{ color: '#ef4444' }}>Prüfung fehlgeschlagen</span>}
          </div>
        )}

        {/* ── Statistiken ── */}
        <SectionTitle>Statistiken</SectionTitle>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
          {[
            { label: 'Spielzeit',       value: fmtPlayTime(stats.totalPlayTime) },
            { label: 'Aufstiege',       value: stats.ascensions },
            { label: 'Erforschungen',   value: stats.researched },
            { label: 'Beschwörungen',   value: stats.summoned },
            { label: 'Bosse besiegt',   value: stats.bossKilled },
            { label: 'Upgrades',        value: stats.upgraded },
            { label: 'Achievements',    value: `${achievements?.unlocked?.length ?? 0}/${19}` },
            { label: 'Abyss-Marken',    value: `${fmt(resources.abyssMarken ?? 0)} ⬡` },
          ].map(({ label, value }) => (
            <div key={label} className="statCard">
              <div className="statLabel">{label}</div>
              <div className="statValue" style={{ color: '#c8b89a' }}>{value}</div>
            </div>
          ))}
        </div>

        {/* ── Gefahr ── */}
        <SectionTitle>⚠️ Gefahrenzone</SectionTitle>
        <SettingRow label="Spielstand löschen" desc="Alle Daten inkl. Aufstieg und Achievements">
          <ActionBtn
            onClick={() => {
              if (window.confirm('ACHTUNG: Kompletten Spielstand löschen?\nAlle Daten gehen verloren!')) hardReset()
            }}
            variant="danger"
          >
            ☠️ Alles löschen
          </ActionBtn>
        </SettingRow>
      </div>
    </GrimPanel>
  )
}
