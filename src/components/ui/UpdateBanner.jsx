import { useState } from 'react'
import { useGameStore } from '../../store/gameStore'
import { C } from './primitives'

export default function UpdateBanner() {
  const { info, setInfo } = useGameStore(s => ({ info: s.updateInfo, setInfo: s.setUpdateInfo }))
  const [dismissed, setDismissed] = useState(false)
  if (!info || dismissed) return null
  const api = window.api

  return (
    <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 90, display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 16px', background: '#100c18', borderTop: `1px solid ${C.gold}44` }}>
      <span className="anim-flicker" style={{ color: C.gold }}>⬡</span>
      <div style={{ flex: 1, fontFamily: 'JetBrains Mono', fontSize: '11px', color: C.text }}>
        {info.status === 'available'    && `Update v${info.version} verfügbar`}
        {info.status === 'downloading'  && `Download läuft...`}
        {info.status === 'downloaded'   && `v${info.version} bereit zur Installation`}
        {info.status === 'not-available'&& `Neuste Version installiert`}
        {info.status === 'error'        && `Update-Prüfung fehlgeschlagen`}
      </div>
      {info.status === 'available'  && <button onClick={() => api?.downloadUpdate()} style={{ fontFamily: 'JetBrains Mono', fontSize: '11px', color: C.gold, background: 'none', border: `1px solid ${C.gold}66`, borderRadius: '5px', padding: '4px 10px', cursor: 'pointer' }}>Herunterladen</button>}
      {info.status === 'downloaded' && <button onClick={() => api?.installUpdate()} className="anim-pulse" style={{ fontFamily: 'JetBrains Mono', fontSize: '11px', color: C.gold, background: 'none', border: `1px solid ${C.gold}`, borderRadius: '5px', padding: '4px 10px', cursor: 'pointer' }}>Installieren & Neustarten</button>}
      <button onClick={() => setDismissed(true)} style={{ color: C.textSub, background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px' }}>✕</button>
    </div>
  )
}
